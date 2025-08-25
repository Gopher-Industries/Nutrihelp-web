import React, { useMemo, useRef, useState } from "react";
import "./user-profile.css";
 
const GOALS = [
  { id: "muscle", label: "Muscle Gain" },
  { id: "weightloss", label: "Weight Loss" },
  { id: "generalwell", label: "General Well-Being" },
  { id: "hypertension", label: "Hypertension Control" },
  { id: "hearthealth", label: "Heart Health" },
];
 
const initial = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
  goals: [],
  avatar: null,
};
 
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");
const phoneOk = (p) => /^[0-9]{8,15}$/.test((p || "").replace(/\s/g, ""));
 
export default function UserProfilePage() {
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const fileRef = useRef(null);
 
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const mark = (k) => setTouched((t) => ({ ...t, [k]: true }));
 
 
  const completion = useMemo(() => {
    const checks = [
      !!form.name && emailOk("a@a.co") ? !!form.name : !!form.name, 
      emailOk(form.email),
      phoneOk(form.phone),
      form.password.length >= 6,
      form.confirm === form.password && !!form.confirm,
      !!form.avatar,
      form.goals.length > 0,
    ];
    const done = checks.reduce((s, b) => s + (b ? 1 : 0), 0);
    return Math.round((done / checks.length) * 100);
  }, [form]);
 
  const errors = useMemo(() => {
    const e = {};
    if (!form.name) e.name = "Enter your full name";
    if (!emailOk(form.email)) e.email = "Enter a valid email";
    if (!phoneOk(form.phone)) e.phone = "Phone must be 8–15 digits";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords don’t match";
    if (!form.goals.length) e.goals = "Pick at least one goal";
    return e;
  }, [form]);
 
  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set("avatar", { file, url });
  };
 
  const toggleGoal = (id) =>
    set(
      "goals",
      form.goals.includes(id)
        ? form.goals.filter((g) => g !== id)
        : [...form.goals, id]
    );
 
  const submit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirm: true,
      goals: true,
    });
    if (Object.keys(errors).length) return;
    console.log("PROFILE", form);
    alert("Profile saved!");
  };
 
  const reset = () => {
    setForm(initial);
    setTouched({});
    if (fileRef.current) fileRef.current.value = "";
  };
 
  return (
    <div className="profile-page">
      <div className="grid">

        <form className="card form horizontal"  onSubmit={submit} noValidate>
          <div className="band">
            <h2>User Profile</h2>
            <div className="band-right">{completion}% complete</div>
          </div>
 
          <div className="pad">
         
            <div className="form-grid">
         
              <Field
                id="name"
                label="Full Name"
                placeholder="Type your name"
                value={form.name}
                onChange={(v) => set("name", v)}
                onBlur={() => mark("name")}
                error={touched.name && errors.name}
              />
 
              <Field
                id="email"
                label="Email"
                type="email"
                placeholder="you@domain.com"
                value={form.email}
                onChange={(v) => set("email", v)}
                onBlur={() => mark("email")}
                error={touched.email && errors.email}
              />
 
              <Field
                id="password"
                label="Password"
                type="password"
                placeholder="••••••"
                value={form.password}
                onChange={(v) => set("password", v)}
                onBlur={() => mark("password")}
                error={touched.password && errors.password}
              />
 
              <Field
                id="confirm"
                label="Confirm Password"
                type="password"
                placeholder="retype password"
                value={form.confirm}
                onChange={(v) => set("confirm", v)}
                onBlur={() => mark("confirm")}
                error={touched.confirm && errors.confirm}
              />
 
       
             
 
              <Field
                id="phone"
                label="Contact Number"
                inputMode="tel"
                placeholder="e.g., 0412345678"
                value={form.phone}
                onChange={(v) => set("phone", v)}
                onBlur={() => mark("phone")}
                error={touched.phone && errors.phone}
              />
 
           
              <div className="col-span-3">
                <label className="block-label">Fitness Goals</label>
                <div className="chips">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={
                        "chip " + (form.goals.includes(g.id) ? "on" : "")
                      }
                      onClick={() => toggleGoal(g.id)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                {touched.goals && errors.goals && (
                  <small className="error">{errors.goals}</small>
                )}
              </div>
 
              <div className="avatar-col native-upload">
                <span className="label">Upload your Profile Picture</span>
                  <div className="avatar">
                    <img
                      alt="avatar"
                      src={
                        form.avatar?.url ||
                        "./images/avatar.png"
                      }
                    />
                  </div>
                  <div className="upload-wrap">
                  <input
                    ref={fileRef}
                    className="file-input"
                    type="file"
                    accept="image/*"
                    onChange={onPick}
                  />
                </div>
              </div>
            </div>
          </div>
 
          <div className="actions">
            <button className="btn primary" type="button" onClick={reset}>
              Reset
            </button>
            <button className="btn primary" type="submit">
              Save Changes
            </button>
          </div>
        </form>
 
    
        <aside className="card preview">
          <div className="band">
            <h2>Preview</h2>
          </div>
          <div className="pad">
            <div className="preview-avatar">
              <img src={form.avatar?.url || "./images/avatar.png"} />
            </div>
            <div className="kv">
              <span>Name</span>
              <strong>{form.name || "—"}</strong>
            </div>
            <div className="kv">
              <span>Email</span>
              <strong>{form.email || "—"}</strong>
            </div>
            <div className="kv">
              <span>Phone</span>
              <strong>{form.phone || "—"}</strong>
            </div>
            <div className="kv goals-line">
              <span>Goals</span>
              <div className="pill-wrap">
                {form.goals.length ? (
                  form.goals.map((id) => (
                    <span className="pill" key={id}>
                      {GOALS.find((g) => g.id === id)?.label || id}
                    </span>
                  ))
                ) : (
                  <em>none</em>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
 

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  type = "text",
  inputMode,
}) {
  return (
    <label htmlFor={id} className={"field " + (error ? "has-error" : "")}>
      <span className="label">{label}</span>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={!!error}
      />
      {error ? <small className="error">{error}</small> : null}
    </label>
  );
}