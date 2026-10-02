# Security Policy

## Overview

NutriHelp Web is the frontend application for the NutriHelp platform.

The application includes authentication, user profiles, health-related tools,
meal and product scanning, community features, administrative functionality,
API communication and third-party service integrations.

Security vulnerabilities should be reported responsibly so they can be
reviewed and resolved before public disclosure.

## Supported Version

The current `master` branch is the actively maintained version of the project.

| Version | Supported |
| ------- | --------- |
| master  | Yes       |
| Older branches | No |

## Reporting a Vulnerability

Please do not publicly report security vulnerabilities through GitHub Issues.

If you discover a potential vulnerability, report it privately to the
NutriHelp project maintainers.

Where possible, include:

- A clear description of the vulnerability
- The affected page, route, component or feature
- Steps required to reproduce the issue
- Expected behaviour
- Actual behaviour
- Potential security impact
- Relevant screenshots or console output
- Suggested remediation, if known

Do not include passwords, authentication tokens, API keys or other sensitive
credentials in public reports.

## Security Areas

Security reports may include issues involving:

- Authentication and MFA flows
- Protected routes
- Administrative access controls
- Input validation
- User-generated content
- Cross-site scripting (XSS)
- API request handling
- File and image uploads
- Redirect behaviour
- Sensitive data exposure
- Browser storage
- Dependency vulnerabilities
- Environment configuration
- Third-party service integrations

## Authentication and Access Control

NutriHelp Web uses protected routes for authenticated functionality.

Administrative features must only be accessible to authorised users.

Client-side route protection improves the user experience but must not be
treated as the only security control. Access control must also be enforced by
the backend API for protected data and operations.

Security issues involving authentication bypass, incorrect redirects,
privilege escalation or unauthorised access should be reported.

## Input Validation

User input should be validated before being submitted or processed.

Validation should include, where appropriate:

- Required fields
- Maximum and minimum input lengths
- Email and structured data formats
- Numeric ranges
- Whitespace-only input
- Unexpected or malformed values
- File type restrictions
- File size restrictions

Client-side validation must not replace server-side validation.

## User-Generated Content and XSS

NutriHelp includes features where users may create or view dynamic content.

Untrusted content must not be inserted directly into the page as executable
HTML.

Developers should avoid unsafe HTML rendering and ensure that user-controlled
content is safely escaped or sanitised before display.

Particular care should be taken with:

- Community content
- Recipe content
- Profile information
- Search results
- API-provided content
- URLs and redirect values

## File and Image Handling

Features involving file or image uploads should validate:

- File type
- File extension
- File size
- Unexpected or malformed files

Client-side validation alone must not be trusted for upload security.

Backend validation is required before uploaded content is stored or processed.

## API Communication

Frontend requests to NutriHelp backend services should:

- Use approved API endpoints
- Handle authentication correctly
- Handle unauthorised responses safely
- Avoid exposing sensitive information in URLs
- Avoid leaking internal error information
- Validate data received from external services before use where appropriate

## Sensitive Data and Browser Storage

Sensitive information should not be unnecessarily stored in browser storage.

Passwords, private credentials and long-lived secrets must never be stored in
client-side source code.

Authentication data stored in the browser should be handled carefully because
client-side data may be accessible if a browser-based vulnerability occurs.

## Environment Configuration and Secrets

Environment files and configuration values should be reviewed before being
committed to the repository.

Frontend applications must assume that values included in the browser build
can become visible to users.

Do not commit private credentials such as:

- Private API keys
- Service-role keys
- Backend secrets
- Database credentials
- JWT signing secrets
- Private service tokens

Only public or explicitly client-safe configuration values should be exposed
to frontend code.

If a sensitive credential is accidentally committed, it should be revoked and
replaced.

## Dependency Security

NutriHelp Web uses npm dependencies.

Dependencies should be regularly reviewed and updated.

Dependabot is used to monitor dependency updates and vulnerabilities, while
CodeQL is used for automated source-code security analysis.

Security-related dependency updates should be tested before merging.

## Third-Party Services

NutriHelp Web integrates with external services including authentication,
data, media and API providers.

Third-party credentials and configuration should use the minimum required
permissions.

Developers should review third-party security requirements before adding new
services or exposing configuration to the browser.

## Responsible Security Testing

Security testing should only be performed on environments that you are
authorised to test.

Do not:

- Access another user's account or personal information
- Modify or delete real user data
- Perform denial-of-service testing
- Flood application or API endpoints
- Attempt to obtain production credentials
- Publicly disclose unresolved vulnerabilities

Use local or approved development environments whenever possible.

## Vulnerability Response

When a vulnerability is reported, the project team should:

1. Review and reproduce the issue.
2. Identify the affected component or workflow.
3. Assess the potential security impact.
4. Develop and test an appropriate fix.
5. Review the change before merging.
6. Confirm that the vulnerability has been resolved.
7. Document the remediation where appropriate.
