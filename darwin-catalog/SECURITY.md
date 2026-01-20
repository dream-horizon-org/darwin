# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest | :x:                |

## Reporting a Vulnerability 

Please report (suspected) security vulnerabilities to **[INSERT SECURITY EMAIL OR SECURITY POLICY URL]**. You will receive a response within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity but historically within a few days.

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Security Best Practices

When using this software, please follow these security best practices:

1. **Keep dependencies updated**: Regularly update dependencies to receive security patches
2. **Use environment variables**: Never commit secrets or credentials to the repository
3. **Enable HTTPS**: Always use HTTPS in production environments
4. **Database security**: Use strong passwords and restrict database access
5. **Regular audits**: Perform regular security audits of your deployment

## Disclosure Policy

When we receive a security bug report, we will assign it to one of the project maintainers. This person will coordinate the fix and release process, involving the following steps:

1. Confirm the problem and determine the affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all releases still under maintenance
4. Release the fixes and publicly disclose the vulnerability

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1, 1.0.2) and will be clearly marked in the release notes.

