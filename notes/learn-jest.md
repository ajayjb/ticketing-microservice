# Jest Lifecycle Methods: beforeAll, afterAll, beforeEach

Jest provides lifecycle methods to manage setup and teardown operations for tests. These methods allow you to run code at specific times in the testing lifecycle.

---

## beforeAll(callback)

- **Runs once** before all tests in the file.
- Commonly used for **expensive setup** operations (e.g., database connections).

```javascript
beforeAll(() => {
  // Runs once before all tests
  console.log("Setting up before all tests");
});
```

---

## afterAll(callback)

- **Runs once** after all tests in the file.
- Useful for **cleanup** operations (e.g., closing connections).

```javascript
afterAll(() => {
  // Runs once after all tests
  console.log("Cleaning up after all tests");
});
```

---

## beforeEach(callback)

- **Runs before each** individual test.
- Ensures a **fresh setup** for every test, such as resetting data or mocks.

```javascript
beforeEach(() => {
  // Runs before each test
  console.log("Setting up before each test");
});
```

---

## Example Usage

```javascript
describe("Math operations", () => {
  beforeAll(() => {
    console.log("Connecting to DB...");
  });

  afterAll(() => {
    console.log("Disconnecting from DB...");
  });

  beforeEach(() => {
    console.log("Resetting test data...");
  });

  test("1 + 1 equals 2", () => {
    expect(1 + 1).toBe(2);
  });

  test("2 * 3 equals 6", () => {
    expect(2 * 3).toBe(6);
  });
});
```

### Output:

```
Connecting to DB...
Resetting test data...
✓ 1 + 1 equals 2
Resetting test data...
✓ 2 * 3 equals 6
Disconnecting from DB...
```

---

## Best Practices

- Use `beforeAll` and `afterAll` for shared, costly setup/teardown.
- Use `beforeEach` to isolate test cases and ensure consistent state.
- Combine with `afterEach` for per-test cleanup, if needed.

# Jest Methods 
toBe used for primitive data comparision
toEqual used for both object and primitive data comparision