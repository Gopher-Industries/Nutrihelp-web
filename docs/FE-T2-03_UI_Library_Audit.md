# FE-T2-03

# UI Library Audit

# MUI / Semantic UI → Ant Design

# Migration Plan

Prepared by: Thisarani Upayangika Uggallage

Sprint: Sprint 1

Date: 26 July 2026

# TABLE OF CONTENTS

1. Introduction ..................................................................................... 3

2. Objective ......................................................................................... 3

3. Audit Method .................................................................................... 4

4. Audit Findings ................................................................................... 8

   4.1 Material UI Components ..................................................... 8

   4.2 Semantic UI React Components.......................................... 9

5. UI Library Dependency Inventory………………………………………………….14-15

6. Ant Design Availability ........................................................................15

7. Ant Design Equivalents ......................................................................16

8. Components Requiring Design Sign-off……………….……………….………..16

9. Sprint 2 Migration Plan and Acceptance Criteria ................................ 16-20

10. Conclusion .................................................................................... 20

References .......................................................................................... 21


# 1. Introduction

The frontend application currently makes use of a number of UI libraries, such as
Material UI (MUI) and Semantic UI. Although both of these libraries offer reusable
interface components, the fact that multiple UI libraries are employed increases
the complexity of development, leads to inconsistencies in the user interface, and
makes future maintenance more difficult.

The audit covers all the present use of Material UI and Semantic UI components
in the project and establishes a migration plan with the aim of standardising the
frontend on Ant Design. The task consists solely of conducting the analysis and
preparing the plan; it includes no actual code changes. (Gopher Industries, 2026).


# 2. Objective

This task was intended to audit the frontend part of the NutriHelp application in
order to find all the Material UI and Semantic UI React components that are
currently in use in the project, and it also sought to estimate the amount of effort
needed to replace those components with Ant Design as well as to identify any
possible problems that might arise during the migration.

A concrete and well-defined plan is needed to consolidate the NutriHelp frontend
onto a single UI library with the FE-T2-03 ticket. This ticket includes the audit and
planning phases only and does not involve any code migration during Sprint 1
(NutriHelp Frontend Team, 2026).


# 3. Audit Method

The initial synchronisation of the project with the most up-to-date version of the
master branch was conducted using Git in order that the audit might be
completed on the most recent source code.

To locate all the imports of Material UI and Semantic UI React within the src
directory, the global search feature of Visual Studio Code was used.

The following research was carried out:

- @mui/material
- semantic-ui-react

Each of the matching files was opened and examined separately to identify the
components that had been imported and to understand how they were being
used.

Finally, the installed Ant Design version was verified using npm.


# Evidence

Figure 1. Git repository synchronised with the latest master branch before
beginning the audit.

Figure 2. Global search showing the only Material UI import found in the project.

Figure 3. Global search showing all Semantic UI React imports identified in the
project.


# 4. Audit Findings

## 4.1 Material UI Components

Only one Material UI component was found.

| File | Component | Complexity |
|---|---|---|
| src/routes/Settings/Settings.js | Slider | Medium |

The Slider component is customised with styling and additional properties such
as minimum value, maximum value, step size and value labels. Because of these
customisations, replacing it with the Ant Design Slider will require some styling
adjustments, although the migration complexity is considered moderate.

## Evidence

Figure 4. Material UI Slider implementation inside Settings.js.


## 4.2 Semantic UI React Components

Five files currently use Semantic UI React.

| File | Components Used | Estimated Complexity |
|---|---|---|
| Fields.jsx | Button | Low |
| Inputs.jsx | Button | Low |
| SectionHeader.jsx | Header | Low |
| SectionIngredients.jsx | Button | Low |
| RecipeCardExtension.jsx | Grid, GridRow, GridColumn, Icon, Image | High |

Most files only have a Button or Header component, which makes the migration
easy.

The file RecipeCardExtension.jsx has layout components and icons that are very
connected, to the page layout. The RecipeCardExtension.jsx file has a higher
migration risk because its layout and visual components are closely connected. A
review of the frontend source found no dedicated automated test file for this
component. Therefore, Sprint 2 should include creating appropriate component
tests for RecipeCardExtension.jsx, in addition to regression testing after the
migration.

## Evidence

Figure 5. Button component used in Fields.jsx.

Figure 6. Button component used in Inputs.jsx.

Figure 7. Header component used in SectionHeader.jsx.

Figure 8. Button component used in SectionIngredients.jsx.

Figure 9. Multiple Semantic UI React components used in
RecipeCardExtension.jsx.


# 5. UI Library Dependency Inventory

## Existing UI Library Dependencies

| Package | Installed Version | Purpose | Planned Action |
|---|---|---|---|
| @mui/material | 7.3.6 | Provides the Material UI Slider component used in Settings.js. | Remove after the Slider has been migrated to Ant Design. |
| @emotion/react | 11.14.0 | Styling dependency required by Material UI. | Verify no remaining Material UI components depend on it before removal. |
| @emotion/styled | 11.14.1 | Styling dependency required by Material UI. | Remove together with Material UI after confirming it is no longer required. |
| semantic-ui-react | 2.1.4 | Provides the Button, Header, Grid, GridRow, GridColumn, Icon and Image components currently used by the project. | Remove after all Semantic UI components have been migrated. |
| semantic-ui-css | 2.5.0 | Provides Semantic UI styling and CSS resources. | Remove after migration and after confirming no remaining CSS imports exist. |
| antd | Declared version in package.json: ^5.22.3 Current installed version: 5.29.3 | Target UI library for the migration. | Keep as the project's standard UI library. |

The UI dependencies were checked against both package.json and package-
lock.json. The current local Ant Design installation was also confirmed using
npm. These items create a list to help with Sprint 2 cleanup. Outdated UI
dependencies should only be deleted after the migration is done after testing
shows everything works and after there are no imports left in the project.


# 6. Ant Design Availability

The Ant Design package is already installed in the project.

Installed version:

antd 5.29.3

@ant-design/icons is not declared as a direct project dependency in package.json.
It is present as a dependency of Ant Design in package-lock.json. If Sprint 2
requires direct icon imports, the team should confirm whether it needs to be
added explicitly as a direct dependency.This means the migration can begin
without installing the main Ant Design library, although icons may need to be
added later if required.

## Evidence

Figure 10. Terminal output confirming Ant Design installation.


# 7. Ant Design Equivalents

| Current Library | Component | Ant Design Equivalent | Complexity |
|---|---|---|---|
| Material UI | Slider | Slider | Medium |
| Semantic UI | Button | Button | Low |
| Semantic UI | Header | Typography.Title | Low |
| Semantic UI | Grid | Row / Col | Medium |
| Semantic UI | GridRow | Row | Medium |
| Semantic UI | GridColumn | Col | Medium |
| Semantic UI | Icon | Icons package | Medium |
| Semantic UI | Image | Image | Low |


# 8. Components Requiring Design Sign-off

The Settings.js Slider should be reviewed after migration to ensure its styling and
behaviour remain consistent with the current interface. The
RecipeCardExtension component should also be reviewed because replacing the
Semantic UI Grid layout with Ant Design Row and Col components may affect
spacing, alignment and responsiveness.


# 9. Sprint 2 Migration Plan

Based on the audit findings, Sprint 2 should begin by replacing the Button
components in the CreateRecipe module because they have the lowest migration
complexity. The Header component should then be migrated, followed by the
Material UI Slider in Settings.js. The RecipeCardExtension component should be
migrated last because it contains multiple layout and visual elements that require
additional testing. After all components have been migrated, regression testing
should be completed before removing unused UI library dependencies.

## Proposed Sprint 2 Tickets

| Sprint 2 Task | Files | Estimated Effort | Estimated effort |
|---|---|---|---|
| Ticket 1 – Migrate Button Components | Fields.jsx, Inputs.jsx, SectionIngredients.jsx | Low | 3-4 hours |
| Ticket 2 – Migrate Header Component | SectionHeader.jsx | Low | 2-3 hours |
| Ticket 3 – Migrate Material UI Slider | Settings.js | Medium | 4-6 hours |
| Ticket 4 – Migrate Layout Components | RecipeCardExtension.jsx | High | 6-8 hours |
| Ticket 5 – Final Testing and Cleanup | Entire project | Medium | 4-6 hours |

Effort Estimation: The estimated effort is shown as a range of implementation
hours, for Sprint 2 planning. This Effort Estimation includes component
replacement, styling and layout adjustments, functional verification, accessibility
checks and required testing. Actual effort may vary depending on design sign-off
issues identified during regression testing and the amount of existing test
coverage.


# Sprint 2 Acceptance Criteria

## Button components – Fields.jsx, Inputs.jsx and SectionIngredients.jsx

- Semantic UI Button imports need to be changed to Ant Design Button
components.
- Button click actions and disabled states should still function properly.
- Buttons should be accessible through keyboard navigation.
- Buttons should have an visible focus state.
- Buttons should have accessible names.
- The Create Recipe layout should stay responsive, on desktop screens and
tablet screens and mobile screen sizes.


## Header component – SectionHeader.jsx

- The Semantic UI Header must be replaced with the appropriate Ant Design
Typography component.
- The heading text and hierarchy must remain correct.
- The component must remain readable and correctly aligned across
different screen sizes.
- Spacing and appearance must receive design approval.


## Slider – Settings.js

- The Material UI Slider needs to be replaced with the Ant Design Slider.
- The Ant Design Slider must have the minimum maximum, step and value
behaviour, as the original.
- The Ant Design Slider must continue to work with keyboard interaction.
- The Ant Design Slider must show a focus state.
- The Ant Design Slider must have a name.
- The Ant Design Slider layout must stay responsive.
- The Ant Design Slider that is migrated must get design sign-off.


## RecipeCardExtension.jsx

- Semantic UI Grid, GridRow and GridColumn components must be replaced
with Ant Design layout components.
- Image and Icon components must be replaced with suitable Ant Design or
approved project alternatives.
- If Ant Design icons are selected for the migration add @ant-design/icons as
a direct project dependency and update package.json and package-
lock.json accordingly. Verify that the required icons import and render
correctly after migration.
- Recipe information must remain visible and correctly aligned.
- The layout must remain responsive across mobile, tablet and desktop
widths.
- Interactive elements must support keyboard navigation and visible focus.
- Images and interactive controls must have appropriate accessible names or
alternative text.
- Existing recipe-card functionality must continue to work after migration.
- Create automated component tests, for RecipeCardExtension.jsx as no
dedicated test file was found during the frontend source review. The tests
should check that the moved component displays properly keeps recipe-
card features and actions and follows the intended responsive design
behavior.
- The final layout must receive design sign-off.


## Final testing and cleanup

- Search the project and confirm there are no remaining @mui/material
imports.
- Confirm there are no remaining semantic-ui-react imports.
- Confirm unused Semantic UI CSS imports are removed.
- Confirm keyboard navigation and focus behaviour work correctly.
- Confirm accessible names are present where required.
- Confirm text and interactive UI elements meet WCAG 2.1 AA colour-
contrast requirements, including at least 4.5:1 for normal text and 3:1 for
large text and relevant UI components
- Confirm affected pages remain responsive.
- Confirm Create Recipe and RecipeCardExtension functionality still works.
- Run the existing frontend test suite together with the newly created
RecipeCardExtension.jsx component tests and confirm that all relevant
tests pass.
- Remove unused UI dependencies only after all migration and testing is
complete.
- Verify that affected migrated components have appropriate automated or
regression test coverage and add further tests where required before final
migration sign-off.


# 10. Conclusion

The audit identified one Material UI component and five files using Semantic UI
React. Most components have low to medium migration complexity and can be
replaced with equivalent Ant Design components with relatively limited
implementation effort. RecipeCardExtension.jsx requires additional attention
because it depends on multiple layout and visual components and currently has
no dedicated automated test file identified within the reviewed frontend source.
Since Ant Design is already installed, the project is ready to proceed to the
migration phase.

The findings from this audit give a picture of the current UI library usage in the
NutriHelp frontend application. The suggested migration plan and Sprint 2 task
sequence create a way to move the project to Ant Design while keeping migration
risks low and making sure the user interface stays consistent. This audit can be
used as a guide, for migration work and help with planning during the next
sprint.


# References

Gopher Industries 2026, NutriHelp Project Handover Document, Trimester 1,
2026, internal project document, Gopher Industries.

NutriHelp Frontend Team 2026, NutriHelp Frontend Sprint 1 Detailed Task
Breakdown, Trimester 2, 2026, internal project planning document, Gopher
Industries.