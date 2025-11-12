# GitHub Repository Explorer

A Vue.js 3 + TypeScript application for exploring GitHub repositories with advanced search, filtering, and comparison features.

## Features

- **Repository Search**: Real-time search with debouncing and pagination
- **Detailed Views**: Comprehensive repository information with README rendering
- **Smart Filtering**: Filter by language, stars, dates, and license types
- **Repository Comparison**: Side-by-side comparison with visual insights
- **Bookmarks**: Save and manage favorite repositories
- **Performance**: Multi-tier caching and optimized loading
- **Accessibility**: WCAG 2.1 Level AA compliant

## Tech Stack

- Vue.js 3 (Composition API)
- TypeScript (Strict Mode)
- Vite
- GitHub REST API v3

## Setup

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd github-repository-explorer
   npm install
   ```

2. **GitHub Token**
   - Generate Personal Access Token at [GitHub Settings](https://github.com/settings/tokens)
   - Create `.env` file:
     ```
     VITE_GITHUB_TOKEN=your_token_here
     ```

3. **Run Development**
   ```bash
   npm run dev
   ```

## Architecture

Follows layered architecture with Repository Pattern, implementing Factory, Observer, Strategy, and Decorator patterns. SOLID principles enforced throughout.

## Testing

```bash
npm run test        # Unit tests
npm run test:coverage  # Coverage report
```

## Deployment

Deployed on [Netlify](your-app-url) with environment variables configured.
