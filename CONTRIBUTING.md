# Contributing to Random Film Suggester

First off, thanks for considering contributing to Random Film Suggester! It's people like you that make it such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem** in as many details as possible
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs** if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the steps
- **Describe the current behavior** and the expected enhancement behavior
- **Explain why this enhancement would be useful**

## Development Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git

### Setup Instructions

1. Fork and clone the repository:
```bash
git clone https://github.com/your-username/random-film-suggester.git
cd random-film-suggester
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` with TMDB API key:
```env
NEXT_PUBLIC_TMDB_API_KEY=your_key_here
```

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Making Changes

### Branch Naming

- Feature: `feature/description-of-feature`
- Bug fix: `fix/description-of-bug`
- Improvement: `improvement/description`

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Be descriptive but concise
- Reference issues when relevant: "Fix #123"

### Code Style

- Follow existing code style and formatting
- Use TypeScript for type safety
- No ESLint warnings should be introduced
- Format code with Prettier (automatic on save)

### Testing

- Test your changes locally before pushing
- Try various screen sizes for responsive design
- Verify localStorage functionality works

## Pull Request Process

1. **Update branches**: Ensure your branch is up-to-date with `main`
2. **Build check**: Run `npm run build` and ensure no errors
3. **Create PR**: Push your branch and open a pull request
4. **PR Description**: Include:
   - What changes did you make?
   - Why are these changes necessary?
   - Screenshots/GIFs if UI changes
   - Related issues (fixes #123)
5. **Code review**: Respond to review feedback
6. **Merge**: Maintainers will merge once approved

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Build passes (`npm run build`)
- [ ] No new warnings introduced
- [ ] Changes tested locally
- [ ] Commit messages are clear
- [ ] PR description is complete

## Architecture Guidelines

### When Adding Features

- **Keep it simple**: No over-engineering for MVP
- **No external state libraries**: Stick with React Context
- **No auth/backend**: Local-first only
- **CSS Modules only**: No Tailwind or other frameworks
- **TypeScript strict mode**: All code must be type-safe

### Component Guidelines

- Create reusable components when logic appears twice
- Use CSS Modules for styling, one file per folder
- Export types from component index
- Keep components focused and single-responsibility

### File Structure

New components:
```
src/components/ComponentName/
├── index.tsx      # Component code
├── style.module.css # Styles
└── types.ts       # Interfaces (if needed)
```

New pages:
```
src/app/pagename/
├── page.tsx       # Page component
└── style.module.css # Styles
```

New utilities:
```
src/utils/
└── utility-name.ts  # Utility functions with types
```

## Questions or Need Help?

- Open a discussion for questions
- Check existing issues and PRs
- Review [MVP_DOCS.md](MVP_DOCS.md) for architecture details

---

Thank you for contributing! 🚀
