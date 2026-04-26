# Contributing to KeyZen

Thank you for your interest in contributing to KeyZen! This document provides guidelines and instructions for contributing to this project.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager

### Setup

1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/KeyZen.git
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
```

### Code Quality

Before submitting a pull request, ensure your code passes all quality checks:

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Format code
pnpm format
```

## Pull Request Process

1. Ensure all tests and quality checks pass
2. Update documentation if applicable
3. Your PR will be reviewed by a maintainer
4. Once approved, your changes will be merged

## Coding Conventions

- Use functional components with React hooks
- Follow the existing code style and structure
- Use TypeScript for type safety
- Write self-documenting code (avoid unnecessary comments)
- Ensure responsive design compatibility

## Issues

- Feel free to submit issues for bugs, feature requests, or improvements
- For bugs, include steps to reproduce and expected behavior
- For features, provide a clear description of the proposed feature

## License

By contributing to KeyZen, you agree that your contributions will be licensed under the project's license.