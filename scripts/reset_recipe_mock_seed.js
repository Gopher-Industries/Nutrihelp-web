#!/usr/bin/env node
/* eslint-disable no-console */
const path = require("path");
const { Client } = require("pg");
const XLSX = require("xlsx");

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-./]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function firstNonEmpty(source, keys) {
  for (const key of keys) {
    const value = String(source[key] ?? "").trim();
    if (value) return value;
  }
  return "";
}

function toQueueRow(rawRow) {
  const normalized = {};
  Object.entries(rawRow || {}).forEach(([key, value]) => {
    normalized[normalizeKey(key)] = String(value ?? "").trim();
  });

  return {
    dish_name: firstNonEmpty(normalized, [
      "dish_name",
      "dishname",
      "dish",
      "recipe_name",
      "recipename",
      "name",
    ]),
    meal_type: firstNonEmpty(normalized, ["meal_type", "mealtype"]),
    cuisine_hint: firstNonEmpty(normalized, ["cuisine_hint", "cuisine", "cuisine_name"]),
    cooking_method_hint: firstNonEmpty(normalized, [
      "cooking_method_hint",
      "cooking_method",
      "method",
      "method_hint",
    ]),
    admin_notes: firstNonEmpty(normalized, ["admin_notes", "notes", "note"]),
  };
}

async function tableExists(client, tableName) {
  const result = await client.query("select to_regclass($1) as reg", [`public.${tableName}`]);
  return Boolean(result.rows[0]?.reg);
}

async function countRows(client, tableName) {
  const result = await client.query(`select count(*)::int as c from public.${tableName}`);
  return Number(result.rows[0]?.c || 0);
}

async function getTableColumns(client, tableName) {
  const result = await client.query(
    `
      select column_name
      from information_schema.columns
      where table_schema = 'public' and table_name = $1
      order by ordinal_position
    `,
    [tableName]
  );
  return result.rows.map((row) => row.column_name);
}

async function truncateIfExists(client, tableName) {
  const exists = await tableExists(client, tableName);
  if (!exists) return false;
  await client.query(`truncate table public.${tableName} restart identity cascade`);
  return true;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  const mockFilePath =
    process.env.MOCK_FILE_PATH ||
    path.resolve(process.cwd(), "..", "recipe_library_import_100_dishes.xlsx");

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const targetTables = [
    "weekly_recipe_ingredient",
    "weeklyrecipes",
    "recipe_library_import_queue",
    "recipe_library",
  ];

  await client.connect();

  try {
    const before = {};
    for (const tableName of targetTables) {
      if (await tableExists(client, tableName)) {
        before[tableName] = await countRows(client, tableName);
      }
    }

    const workbook = XLSX.readFile(mockFilePath, { cellDates: false });
    const sheetName = workbook.SheetNames?.[0];
    if (!sheetName) throw new Error(`No sheet found in ${mockFilePath}`);

    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
      raw: false,
    });
    const queueRows = rawRows.map(toQueueRow).filter((row) => String(row.dish_name || "").trim());
    if (queueRows.length === 0) throw new Error("No valid dish rows found in mock file.");

    await client.query("begin");

    for (const tableName of targetTables) {
      await truncateIfExists(client, tableName);
    }

    const queueTableExists = await tableExists(client, "recipe_library_import_queue");
    if (!queueTableExists) {
      throw new Error("Table public.recipe_library_import_queue not found.");
    }

    const queueColumns = await getTableColumns(client, "recipe_library_import_queue");
    const insertableColumns = [
      "dish_name",
      "meal_type",
      "cuisine_hint",
      "cooking_method_hint",
      "admin_notes",
      "status",
    ].filter((col) => queueColumns.includes(col));

    if (!insertableColumns.includes("dish_name")) {
      throw new Error("Column dish_name is missing from recipe_library_import_queue.");
    }

    for (const row of queueRows) {
      const payload = {
        ...row,
        status: "pending",
      };

      const values = insertableColumns.map((col) => payload[col] ?? null);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
      const columnsSql = insertableColumns.join(", ");
      await client.query(
        `insert into public.recipe_library_import_queue (${columnsSql}) values (${placeholders}) on conflict do nothing`,
        values
      );
    }

    await client.query("commit");

    const after = {};
    for (const tableName of targetTables) {
      if (await tableExists(client, tableName)) {
        after[tableName] = await countRows(client, tableName);
      }
    }

    console.log(
      JSON.stringify(
        {
          mockFilePath,
          insertedQueueRows: queueRows.length,
          before,
          after,
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
