/**
 * Validation Utilities
 *
 * Type-safe validation functions including:
 * - Type guards (TypeScript type predicates)
 * - Schema validation
 * - Enum validation
 * - Range validation
 *
 * @module lib/utils/validation
 */

/**
 * Custom ValidationError class for validation failures.
 * Provides structured error information including field name and expected values.
 */
export class ValidationError extends Error {
  /** The field that failed validation (if applicable) */
  public field?: string;
  /** The actual value that was provided */
  public actual?: unknown;
  /** The expected value or type */
  public expected?: unknown;

  constructor(message: string, field?: string, actual?: unknown, expected?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.actual = actual;
    this.expected = expected;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for string type.
 * @param value - Value to check
 * @returns true if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for number type (includes NaN and Infinity).
 * @param value - Value to check
 * @returns true if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

/**
 * Type guard for boolean type.
 * @param value - Value to check
 * @returns true if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for plain object type (excludes null and arrays).
 * @param value - Value to check
 * @returns true if value is a plain object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for array type.
 * @param value - Value to check
 * @returns true if value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard for function type.
 * @param value - Value to check
 * @returns true if value is a function
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * Type guard for null.
 * @param value - Value to check
 * @returns true if value is null
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Type guard for undefined.
 * @param value - Value to check
 * @returns true if value is undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * Type guard for defined values (not undefined).
 * @param value - Value to check
 * @returns true if value is not undefined
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object).
 * @param value - Value to check
 * @returns true if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// ============================================================================
// NUMBER VALIDATION
// ============================================================================

/**
 * Validates that a value is a finite number (excludes NaN and Infinity).
 * @param value - Value to check
 * @returns true if value is a valid finite number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Checks if a number is within a specified range (inclusive).
 * @param value - The number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if value is within [min, max]
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Checks if a number is positive (> 0).
 * @param value - The number to check
 * @returns true if value is greater than zero
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Checks if a number is non-negative (>= 0).
 * @param value - The number to check
 * @returns true if value is zero or greater
 */
export function isNonNegative(value: number): boolean {
  return value >= 0;
}

/**
 * Checks if a number is an integer.
 * @param value - The number to check
 * @returns true if value is an integer
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

// ============================================================================
// ENUM VALIDATION
// ============================================================================

/**
 * Validates that a value is a valid member of an enum.
 * @param value - The value to validate
 * @param enumType - The enum to validate against
 * @returns true if value is in the enum
 *
 * @example
 * enum Color { Red = 'RED', Green = 'GREEN' }
 * isValidEnum('RED', Color); // true
 * isValidEnum('BLUE', Color); // false
 */
export function isValidEnum<T extends Record<string, string | number>>(
  value: unknown,
  enumType: T
): value is T[keyof T] {
  return Object.values(enumType).includes(value as T[keyof T]);
}

// ============================================================================
// PROPERTY VALIDATION
// ============================================================================

/**
 * Type guard that checks if an object has a specific property.
 * @param obj - The object to check
 * @param property - The property name to look for
 * @returns true if object has the property
 */
export function hasProperty<K extends string>(
  obj: unknown,
  property: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && property in obj;
}

/**
 * Checks if an object has all specified properties.
 * @param obj - The object to check
 * @param properties - Array of property names to check for
 * @returns true if object has all properties
 */
export function hasProperties<K extends string>(
  obj: unknown,
  properties: K[]
): obj is Record<K, unknown> {
  if (typeof obj !== 'object' || obj === null) return false;
  return properties.every((prop) => prop in obj);
}

// ============================================================================
// SCHEMA VALIDATION
// ============================================================================

/**
 * Field schema definition for validation.
 */
export interface FieldSchema {
  /** Expected type of the field */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** Whether the field is required */
  required: boolean;
  /** Minimum value (for numbers) */
  min?: number;
  /** Maximum value (for numbers) */
  max?: number;
  /** Custom validator function */
  validator?: (value: unknown) => boolean;
}

/**
 * Schema definition for object validation.
 */
export type Schema = Record<string, FieldSchema>;

/**
 * Validates an object against a schema.
 * Throws ValidationError if validation fails.
 *
 * @param data - The object to validate
 * @param schema - The schema to validate against
 * @throws ValidationError if validation fails
 *
 * @example
 * const schema: Schema = {
 *   name: { type: 'string', required: true },
 *   age: { type: 'number', required: true, min: 0, max: 120 }
 * };
 * validateSchema({ name: 'John', age: 30 }, schema); // OK
 * validateSchema({ name: 'Jane', age: 150 }, schema); // throws
 */
export function validateSchema(data: unknown, schema: Schema): void {
  if (!isObject(data)) {
    throw new ValidationError('Data must be an object', undefined, typeof data, 'object');
  }

  // Check each field in the schema
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const value = data[fieldName];

    // Check required fields
    if (fieldSchema.required && (value === undefined || value === null)) {
      throw new ValidationError(
        `Field '${fieldName}' is required`,
        fieldName,
        value,
        'defined value'
      );
    }

    // Skip validation for optional fields that are not present
    if (!fieldSchema.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    const typeChecks = {
      string: isString,
      number: isNumber,
      boolean: isBoolean,
      object: isObject,
      array: isArray,
    };

    const typeCheck = typeChecks[fieldSchema.type];
    if (!typeCheck(value)) {
      throw new ValidationError(
        `Field '${fieldName}' must be of type ${fieldSchema.type}`,
        fieldName,
        typeof value,
        fieldSchema.type
      );
    }

    // Number range validation
    if (fieldSchema.type === 'number' && isNumber(value)) {
      if (fieldSchema.min !== undefined && value < fieldSchema.min) {
        throw new ValidationError(
          `Field '${fieldName}' must be at least ${fieldSchema.min}`,
          fieldName,
          value,
          `>= ${fieldSchema.min}`
        );
      }
      if (fieldSchema.max !== undefined && value > fieldSchema.max) {
        throw new ValidationError(
          `Field '${fieldName}' must be at most ${fieldSchema.max}`,
          fieldName,
          value,
          `<= ${fieldSchema.max}`
        );
      }
    }

    // Custom validator
    if (fieldSchema.validator && !fieldSchema.validator(value)) {
      throw new ValidationError(
        `Field '${fieldName}' failed custom validation`,
        fieldName,
        value,
        'valid value'
      );
    }
  }
}

/**
 * SchemaValidator class for reusable validation with error collection.
 * Allows validating multiple objects against the same schema and collecting errors.
 *
 * @example
 * const validator = new SchemaValidator(mySchema);
 * if (!validator.validate(data)) {
 *   console.log('Errors:', validator.errors);
 * }
 */
export class SchemaValidator {
  private schema: Schema;
  private _errors: string[] = [];

  /**
   * Creates a new SchemaValidator.
   * @param schema - The schema to validate against
   */
  constructor(schema: Schema) {
    this.schema = schema;
  }

  /**
   * Gets the validation errors from the last validation.
   */
  get errors(): string[] {
    return this._errors;
  }

  /**
   * Validates data against the schema.
   * Collects errors instead of throwing.
   *
   * @param data - The data to validate
   * @returns true if valid, false if invalid
   */
  validate(data: unknown): boolean {
    this._errors = [];

    try {
      validateSchema(data, this.schema);
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        this._errors.push(error.message);
      } else {
        this._errors.push(String(error));
      }
      return false;
    }
  }

  /**
   * Validates data and throws on error.
   * @param data - The data to validate
   * @throws ValidationError if validation fails
   */
  validateOrThrow(data: unknown): void {
    this._errors = [];
    validateSchema(data, this.schema);
  }
}
