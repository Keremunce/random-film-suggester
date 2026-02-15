# Security Policy

## Reporting Security Vulnerabilities

**Please do not open public GitHub issues for security vulnerabilities.**

If you believe you've found a security vulnerability in this project, please email security concerns to the maintainers with:

- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)

We take all security reports seriously and will work to fix confirmed vulnerabilities promptly.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Best Practices for Users

1. **Keep dependencies updated**: Run `npm update` regularly
2. **Protect your TMDB API key**: Never commit `.env.local` or expose your key
3. **Use HTTPS**: Access the application only over secure connections
4. **Browser security**: Keep your browser updated for latest security patches
5. **Data exports**: Handle exported JSON files securely if they contain personal data

## Known Limitations

This is an MVP project with the following security considerations:

- Data is stored in browser localStorage
- No encryption applied to stored data
- Browser DevTools can access stored data
- For sensitive tracking, consider self-hosting
- Export files are not encrypted

## Scope

This security policy covers:
- This GitHub repository
- Deployed instances under maintainer's control

This policy does NOT cover:
- Self-hosted instances
- Third-party forks
- TMDB API security (see https://www.themoviedb.org/settings/security)
