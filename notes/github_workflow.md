# GitHub Actions: Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Workflow Syntax](#workflow-syntax)
4. [Triggers and Events](#triggers-and-events)
5. [Actions](#actions)
6. [Jobs and Steps](#jobs-and-steps)
7. [Environment Variables](#environment-variables)
8. [Secrets and Credentials](#secrets-and-credentials)
9. [Contexts and Expressions](#contexts-and-expressions)
10. [Conditional Execution](#conditional-execution)
11. [Matrix Builds](#matrix-builds)
12. [Artifacts and Caching](#artifacts-and-caching)
13. [Status Checks](#status-checks)
14. [Best Practices](#best-practices)
15. [Examples](#examples)

---

## Introduction

GitHub Actions is a continuous integration/continuous deployment (CI/CD) platform that allows you to automate your build, test, and deployment workflows. Workflows are triggered by events in your repository, such as pushing code, opening a pull request, or creating a release.

### Key Benefits

- **Native Integration**: Built into GitHub with no external services needed
- **Free Minutes**: 2,000 free runner minutes per month for public repos
- **Flexible**: Can automate any workflow, not just CI/CD
- **Scalable**: Use GitHub-hosted runners or self-hosted runners
- **Reusable**: Share actions across repositories and with the community

---

## Core Concepts

### Workflows

A workflow is an automated process defined in a YAML file in your repository. It contains one or more jobs that run on specified events.

### Events

Events trigger workflow runs. Examples include:
- Push events
- Pull requests
- Scheduled times (cron jobs)
- Manual triggers (workflow_dispatch)
- External events (webhooks)

### Jobs

A job is a set of steps that execute on the same runner. Jobs run in parallel by default but can be configured to run sequentially.

### Steps

A step is an individual task that runs in a job. Steps can run commands, set up actions, or run shell scripts.

### Actions

Reusable units of code that can be shared and combined. Actions can be created by GitHub, the community, or yourself.

### Runners

Machines that execute your workflows. GitHub provides hosted runners (Ubuntu, Windows, macOS) or you can use self-hosted runners.

---

## Workflow Syntax

### Basic Structure

```yaml
name: Workflow Name

on: [push, pull_request]

jobs:
  job_name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: echo "Hello World"
```

### File Location

Workflows must be stored in `.github/workflows/` directory in your repository with a `.yml` or `.yaml` extension.

Example path: `.github/workflows/ci.yml`

---

## Triggers and Events

### Push Event

Triggers when code is pushed to a branch.

```yaml
on: push
# or with branches
on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'src/**'
      - 'tests/**'
```

### Pull Request Event

Triggers when a pull request is opened, synchronize, or reopened.

```yaml
on:
  pull_request:
    branches:
      - main
    types:
      - opened
      - synchronize
      - reopened
```

### Scheduled Event (Cron)

Triggers on a schedule using cron syntax.

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
    - cron: '0 */6 * * *'  # Every 6 hours
```

### Manual Trigger

Allows workflow to be triggered manually via GitHub UI.

```yaml
on: workflow_dispatch

jobs:
  manual_job:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Manually triggered"
```

### Multiple Triggers

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
  schedule:
    - cron: '0 9 * * MON'
```

### Event Filters

```yaml
on:
  push:
    branches:
      - 'main'
      - 'feature/**'  # wildcard patterns
    tags:
      - 'v*'
    paths:
      - 'src/**'
      - '!src/docs/**'  # exclude paths
```

---

## Actions

### Using an Action

Actions are referenced with `uses` keyword. They can be from GitHub, a public repository, or a local path.

```yaml
- uses: actions/checkout@v3
- uses: actions/setup-node@v3
  with:
    node-version: '18'
- uses: my-org/my-action@v1
- uses: ./local/path/to/action
```

### Common GitHub Actions

#### Checkout Repository
```yaml
- uses: actions/checkout@v3
  with:
    fetch-depth: 0  # full history
    ref: main  # specific ref
```

#### Setup Node.js
```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '18'
    cache: 'npm'
```

#### Setup Python
```yaml
- uses: actions/setup-python@v4
  with:
    python-version: '3.10'
    cache: 'pip'
```

#### Setup Go
```yaml
- uses: actions/setup-go@v4
  with:
    go-version: '1.20'
```

#### Upload Artifacts
```yaml
- uses: actions/upload-artifact@v3
  with:
    name: my-artifact
    path: dist/
    retention-days: 30
```

#### Download Artifacts
```yaml
- uses: actions/download-artifact@v3
  with:
    name: my-artifact
    path: ./downloads/
```

### Creating a Custom Action

#### JavaScript Action

Create `action.yml` in your action repository:

```yaml
name: 'My Custom Action'
description: 'Does something useful'
inputs:
  who-to-greet:
    description: 'Who to greet'
    required: true
    default: 'World'
outputs:
  greeting:
    description: 'Greeting message'
    value: ${{ steps.greet.outputs.greeting }}
runs:
  using: 'node16'
  main: 'index.js'
```

#### Docker Action

```yaml
name: 'Docker Action'
description: 'Run in Docker'
runs:
  using: 'docker'
  image: 'docker://ubuntu:latest'
  args:
    - 'echo'
    - 'Hello'
```

---

## Jobs and Steps

### Basic Job

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test
```

### Running Commands

```yaml
steps:
  # Single line
  - run: echo "Single command"
  
  # Multi-line
  - run: |
      echo "Line 1"
      echo "Line 2"
  
  # Specific shell
  - run: Write-Host "PowerShell"
    shell: powershell
  
  # Working directory
  - run: npm test
    working-directory: ./app
  
  # Environment variables
  - run: echo $MY_VAR
    env:
      MY_VAR: "value"
```

### Job Dependencies

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building..."
  
  test:
    needs: build  # waits for build to complete
    runs-on: ubuntu-latest
    steps:
      - run: echo "Testing..."
  
  deploy:
    needs: [build, test]  # waits for multiple jobs
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying..."
```

### Step Conditions

```yaml
steps:
  - run: npm test
  
  - name: Report coverage
    if: success()  # runs if previous step succeeded
    run: npm run coverage
  
  - name: Notify on failure
    if: failure()  # runs if previous step failed
    run: echo "Tests failed!"
  
  - name: Always run
    if: always()  # always runs regardless of status
    run: echo "Cleanup"
```

### Step Outputs

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.result }}
    steps:
      - id: version
        run: echo "result=1.0.0" >> $GITHUB_OUTPUT
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying version ${{ needs.build.outputs.version }}"
```

---

## Environment Variables

### Setting Environment Variables

#### At Workflow Level
```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo $REGISTRY/$IMAGE_NAME
```

#### At Job Level
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      NODE_ENV: production
    steps:
      - run: echo $NODE_ENV
```

#### At Step Level
```yaml
steps:
  - run: npm test
    env:
      DEBUG: 'true'
```

### Default Environment Variables

GitHub automatically sets these variables:

```
CI=true
GITHUB_WORKSPACE=/home/runner/work/repo-name/repo-name
GITHUB_EVENT_PATH=/home/runner/work/_temp/_github_workflow/event.json
GITHUB_REF=refs/heads/main
GITHUB_SHA=a1b2c3d4e5f6
GITHUB_ACTOR=username
GITHUB_REPOSITORY=owner/repo
GITHUB_RUN_ID=123456789
GITHUB_RUN_NUMBER=1
```

### Accessing Variables in Workflows

```yaml
steps:
  - run: echo "Repository: ${{ github.repository }}"
  - run: echo "Ref: ${{ github.ref }}"
  - run: echo "SHA: ${{ github.sha }}"
```

---

## Secrets and Credentials

### Creating Secrets

Secrets are created in repository settings under **Settings > Secrets and variables > Actions**.

### Using Secrets

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Secret Best Practices

1. Never log secrets:
```yaml
- run: echo $API_KEY  # DON'T DO THIS
- run: echo "Deployed"  # Safe
```

2. Use masked outputs:
```yaml
- run: echo "::add-mask::${{ secrets.API_KEY }}"
```

3. Use environment variables:
```yaml
env:
  SECRET_VAR: ${{ secrets.MY_SECRET }}
```

4. Token permissions:
```yaml
permissions:
  contents: read
  pull-requests: write
```

### Using GITHUB_TOKEN

GitHub automatically provides `secrets.GITHUB_TOKEN`:

```yaml
steps:
  - uses: actions/github-script@v6
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      script: |
        github.rest.issues.createComment({
          issue_number: context.issue.number,
          owner: context.repo.owner,
          repo: context.repo.repo,
          body: 'Comment via Actions'
        })
```

---

## Contexts and Expressions

### Available Contexts

#### github Context
```yaml
${{ github.event }}
${{ github.repository }}
${{ github.repository_owner }}
${{ github.ref }}
${{ github.ref_name }}
${{ github.sha }}
${{ github.head_ref }}  # PR source branch
${{ github.base_ref }}  # PR target branch
${{ github.event.pull_request.title }}
${{ github.actor }}
${{ github.event_name }}
${{ github.run_id }}
${{ github.run_number }}
${{ github.job }}
```

#### env Context
```yaml
${{ env.MY_ENV_VAR }}
```

#### secrets Context
```yaml
${{ secrets.API_KEY }}
```

#### job Context
```yaml
${{ job.status }}
${{ job.container.network }}
```

#### matrix Context
```yaml
${{ matrix.node-version }}
${{ matrix.os }}
```

#### steps Context
```yaml
${{ steps.step_id.outputs.output_name }}
${{ steps.step_id.outcome }}  # success, failure, cancelled, skipped
${{ steps.step_id.conclusion }}
```

#### runner Context
```yaml
${{ runner.os }}  # Linux, Windows, macOS
${{ runner.arch }}  # X86, ARM64
${{ runner.name }}
${{ runner.tool_cache }}
```

### Expression Functions

#### String Functions
```yaml
${{ contains('hello world', 'world') }}  # true
${{ startsWith('hello', 'he') }}  # true
${{ endsWith('hello', 'lo') }}  # true
${{ toJSON(matrix) }}
${{ fromJSON('{"key": "value"}') }}
```

#### Numeric Functions
```yaml
${{ format('{0} {1}', 'Hello', 'World') }}
```

#### Comparison
```yaml
if: ${{ github.event_name == 'push' }}
if: ${{ github.ref == 'refs/heads/main' }}
if: ${{ contains(github.event.head_commit.message, 'skip ci') }}
```

---

## Conditional Execution

### if Conditions

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - run: echo "Deploying to production"

steps:
  - run: npm test
  - run: npm run coverage
    if: success()
  - run: echo "Something failed"
    if: failure()
  - run: echo "Always runs"
    if: always()
```

### Checking Branch

```yaml
if: github.ref == 'refs/heads/main'
if: startsWith(github.ref, 'refs/heads/release/')
if: contains(github.ref, 'hotfix')
```

### Checking Event Type

```yaml
if: github.event_name == 'push'
if: github.event_name == 'pull_request'
if: github.event_name == 'workflow_dispatch'
```

### Checking Commit Message

```yaml
if: contains(github.event.head_commit.message, '[skip ci]')
if: contains(github.event.pull_request.title, 'WIP')
```

### Boolean Logic

```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
if: github.event_name == 'pull_request' || github.event_name == 'push'
if: !startsWith(github.ref, 'refs/tags/')
```

---

## Matrix Builds

### Basic Matrix

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14, 16, 18, 20]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

### Multiple Dimensions

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
        include:
          - os: ubuntu-latest
            node-version: 18
            coverage: true
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
      - run: npm run coverage
        if: ${{ matrix.coverage }}
```

### Excluding Combinations

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [14, 16, 18]
    exclude:
      - os: windows-latest
        node-version: 14  # Don't test Node 14 on Windows
```

### Fail Fast

```yaml
strategy:
  fail-fast: false  # Continue even if one job fails
  matrix:
    node-version: [16, 18, 20]
```

### Matrix Output

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        version: [1.0, 2.0]
    outputs:
      version: ${{ steps.get-version.outputs.result }}
    steps:
      - id: get-version
        run: echo "result=${{ matrix.version }}" >> $GITHUB_OUTPUT
```

---

## Artifacts and Caching

### Uploading Artifacts

```yaml
- uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: |
      dist/
      coverage/
    retention-days: 30
    if-no-files-found: error
```

### Downloading Artifacts

```yaml
- uses: actions/download-artifact@v3
  with:
    name: test-results
    path: ./results/

# Download all artifacts
- uses: actions/download-artifact@v3
```

### Artifact Examples

```yaml
# Upload build output
- uses: actions/upload-artifact@v3
  with:
    name: build-${{ matrix.os }}
    path: dist/

# Upload test coverage
- uses: actions/upload-artifact@v3
  if: always()
  with:
    name: coverage-report
    path: coverage/

# Upload logs on failure
- uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: failure-logs
    path: logs/
```

### Caching

```yaml
- uses: actions/setup-node@v3
  with:
    node-version: 18
    cache: 'npm'

# Manual cache
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cache
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

# Cache multiple paths
- uses: actions/cache@v3
  with:
    path: |
      ~/.cargo
      target/
    key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
```

### Cache Strategy

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.m2/repository
    key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
    restore-keys: |
      ${{ runner.os }}-maven-
      ${{ runner.os }}-
```

---

## Status Checks

### Setting Status in Code

```yaml
- run: |
    if [ $? -eq 0 ]; then
      echo "::notice::Tests passed"
    else
      echo "::error::Tests failed"
      exit 1
    fi
```

### Using github-script

```yaml
- uses: actions/github-script@v6
  with:
    script: |
      core.setOutput('result', 'success');
      core.info('This is an info message');
      core.debug('This is a debug message');
      core.warning('This is a warning message');
      core.error('This is an error message');
```

### Creating Check Runs

```yaml
- uses: actions/github-script@v6
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    script: |
      github.rest.checks.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        name: 'My Check',
        head_sha: context.sha,
        status: 'completed',
        conclusion: 'success',
        output: {
          title: 'My Check',
          summary: 'Check completed successfully'
        }
      })
```

### Adding Comments to PRs

```yaml
- uses: actions/github-script@v6
  if: github.event_name == 'pull_request'
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: 'Tests passed! ✅'
      })
```

---

## Best Practices

### 1. Use Action Versions

```yaml
# Good: pinned to specific version
- uses: actions/checkout@v3
- uses: actions/setup-node@v3

# Avoid: using main branch
- uses: actions/checkout@main
```

### 2. Minimize Dependencies

```yaml
# Good: use GitHub's built-in actions
- uses: actions/checkout@v3
- run: npm install

# Avoid: unnecessary third-party actions
```

### 3. Security Considerations

```yaml
# Use read-only token permissions
permissions:
  contents: read
  pull-requests: write

# Never commit secrets
- run: |
    echo "This is safe"
    # secrets.API_KEY won't be printed if logged

# Use GITHUB_TOKEN for API calls
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 4. Efficient Caching

```yaml
# Cache with proper key
- uses: actions/cache@v3
  with:
    path: node_modules/
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    restore-keys: ${{ runner.os }}-node-
```

### 5. Readable Workflow Names

```yaml
name: Node.js CI
# Clear step names
- name: Install dependencies
  run: npm install
- name: Run tests
  run: npm test
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
```

### 6. Early Failure Detection

```yaml
# Fail fast for critical checks
strategy:
  fail-fast: true

# Exit on error
- run: |
    set -e
    npm install
    npm test
```

### 7. Consistent Formatting

```yaml
# Use proper indentation and spacing
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
```

### 8. Documentation

```yaml
# Add comments to complex workflows
name: Deploy

# This workflow handles production deployments
# It only runs on tagged releases
on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # Extract version from tag
      - run: echo "VERSION=${GITHUB_REF#refs/tags/}" >> $GITHUB_ENV
```

---

## Examples

### Node.js CI/CD

```yaml
name: Node.js CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Generate coverage
        run: npm run coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Python Testing Matrix

```yaml
name: Python Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        python-version: ['3.8', '3.9', '3.10', '3.11']

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install pytest pytest-cov
          pip install -r requirements.txt

      - name: Run tests
        run: pytest --cov=src tests/

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Docker Build and Push

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Deploy to Production

```yaml
name: Deploy

on:
  push:
    branches: [main]
    paths-ignore:
      - 'README.md'
      - 'docs/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H $DEPLOY_HOST >> ~/.ssh/known_hosts
          ssh -i ~/.ssh/deploy_key deployer@$DEPLOY_HOST 'cd /app && ./deploy.sh'

      - name: Notify deployment
        uses: actions/github-script@v6
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Deployed to production!'
            })
```

### Scheduled Workflow

```yaml
name: Scheduled Tasks

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
    - cron: '0 10 * * MON'  # Every Monday at 10 AM UTC

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check API health
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://api.example.com/health)
          if [ $response -ne 200 ]; then
            echo "API health check failed: $response"
            exit 1
          fi

  database-backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup database
        env:
          DB_URL: ${{ secrets.DB_URL }}
        run: |
          # Backup logic here
          echo "Backup completed"

      - name: Upload to storage
        uses: actions/upload-artifact@v3
        with:
          name: db-backup-$(date +%Y%m%d)
          path: backup/
          retention-days: 30
```

### Release Workflow

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  create-release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v3

      - name: Extract version
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          body: 'Release ${{ steps.version.outputs.version }}'
          draft: false
          prerelease: false
```

---

## Common Issues and Solutions

### Workflow Not Triggering

- **Issue**: Workflow doesn't run on push
- **Solution**: Check event syntax and branch filters in `on:` section
- **Solution**: Ensure workflow file is in `.github/workflows/` directory
- **Solution**: Check that file is on the branch being pushed

### Secrets Not Available

- **Issue**: Secret is empty or undefined
- **Solution**: Verify secret is created in repository settings
- **Solution**: Use correct secret name (case-sensitive)
- **Solution**: Check permissions for workflows

### Jobs Taking Too Long

- **Issue**: Workflow exceeds time limit
- **Solution**: Use caching to speed up builds
- **Solution**: Run jobs in parallel (default behavior)
- **Solution**: Use matrix to distribute work
- **Solution**: Optimize test suites

### Permission Denied Errors

- **Issue**: GITHUB_TOKEN lacks permissions
- **Solution**: Add `permissions:` section to workflow
- **Solution**: Create fine-grained personal access token if needed
- **Solution**: Check if repository allows workflows to write contents

### Docker Build Failures

- **Issue**: Docker layer caching not working
- **Solution**: Use `docker/build-push-action@v4`
- **Solution**: Enable `cache-from: type=gha` and `cache-to: type=gha`
- **Solution**: Use multi-stage builds for efficient images

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Contexts Reference](https://docs.github.com/en/actions/learn-github-actions/contexts)
- [GitHub Actions Pricing](https://github.com/pricing/features/actions)
- [Best Practices for GitHub Actions](https://docs.github.com/en/actions/guides)

---

## Conclusion

GitHub Actions is a powerful platform for automating your development workflows. By mastering workflows, actions, and best practices, you can automate testing, building, and deploying your code efficiently. Start with simple workflows and gradually add complexity as your needs grow.

Key takeaways:
- Use workflows to automate repetitive tasks
- Leverage GitHub's marketplace for pre-built actions
- Implement proper security practices with secrets and permissions
- Cache dependencies to speed up workflows
- Monitor workflow runs and optimize for efficiency
- Document your workflows for team clarity

Happy automating! 🚀