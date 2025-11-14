/**
 * Validation Utilities Test Suite
 *
 * Tests for validation functions including:
 * - Type guards (TypeScript type predicates)
 * - Schema validation
 * - Enum validation
 * - Range validation
 * - Custom ValidationError class
 *
 * All validators should be type-safe and provide clear error messages.
 */

import {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isNull,
  isUndefined,
  isDefined,
  isEmpty,
  isValidNumber,
  isValidEnum,
  isInRange,
  isPositive,
  isNonNegative,
  isInteger,
  hasProperty,
  hasProperties,
  validateSchema,
  ValidationError,
  Schema,
  SchemaValidator,
} from '../validation';

describe('Validation Utilities', () => {
  describe('Type Guards', () => {
    describe('isString', () => {
      it('returns true for strings', () => {
        expect(isString('')).toBe(true);
        expect(isString('hello')).toBe(true);
        expect(isString(new String('test'))).toBe(false); // wrapper object
      });

      it('returns false for non-strings', () => {
        expect(isString(123)).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
        expect(isString({})).toBe(false);
      });
    });

    describe('isNumber', () => {
      it('returns true for numbers', () => {
        expect(isNumber(0)).toBe(true);
        expect(isNumber(123)).toBe(true);
        expect(isNumber(-456)).toBe(true);
        expect(isNumber(3.14)).toBe(true);
        expect(isNumber(NaN)).toBe(true); // NaN is typeof 'number'
        expect(isNumber(Infinity)).toBe(true);
      });

      it('returns false for non-numbers', () => {
        expect(isNumber('123')).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber(undefined)).toBe(false);
      });
    });

    describe('isBoolean', () => {
      it('returns true for booleans', () => {
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(false)).toBe(true);
      });

      it('returns false for non-booleans', () => {
        expect(isBoolean(1)).toBe(false);
        expect(isBoolean(0)).toBe(false);
        expect(isBoolean('true')).toBe(false);
        expect(isBoolean(null)).toBe(false);
      });
    });

    describe('isObject', () => {
      it('returns true for plain objects', () => {
        expect(isObject({})).toBe(true);
        expect(isObject({ key: 'value' })).toBe(true);
        expect(isObject(new Object())).toBe(true);
      });

      it('returns false for non-objects', () => {
        expect(isObject(null)).toBe(false); // null is typeof 'object' but we exclude it
        expect(isObject([])).toBe(false); // arrays are separate
        expect(isObject('string')).toBe(false);
        expect(isObject(123)).toBe(false);
      });
    });

    describe('isArray', () => {
      it('returns true for arrays', () => {
        expect(isArray([])).toBe(true);
        expect(isArray([1, 2, 3])).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-array-constructor
        expect(isArray(new Array())).toBe(true);
      });

      it('returns false for non-arrays', () => {
        expect(isArray({})).toBe(false);
        expect(isArray('string')).toBe(false);
        expect(isArray(null)).toBe(false);
      });
    });

    describe('isFunction', () => {
      it('returns true for functions', () => {
        expect(isFunction(() => {})).toBe(true);
        expect(isFunction(function () {})).toBe(true);
        expect(isFunction(async () => {})).toBe(true);
        expect(isFunction(class {})).toBe(true);
      });

      it('returns false for non-functions', () => {
        expect(isFunction({})).toBe(false);
        expect(isFunction(123)).toBe(false);
        expect(isFunction('function')).toBe(false);
      });
    });

    describe('isNull', () => {
      it('returns true only for null', () => {
        expect(isNull(null)).toBe(true);
      });

      it('returns false for non-null', () => {
        expect(isNull(undefined)).toBe(false);
        expect(isNull(0)).toBe(false);
        expect(isNull('')).toBe(false);
        expect(isNull(false)).toBe(false);
      });
    });

    describe('isUndefined', () => {
      it('returns true only for undefined', () => {
        expect(isUndefined(undefined)).toBe(true);
      });

      it('returns false for non-undefined', () => {
        expect(isUndefined(null)).toBe(false);
        expect(isUndefined(0)).toBe(false);
        expect(isUndefined('')).toBe(false);
        expect(isUndefined(false)).toBe(false);
      });
    });

    describe('isDefined', () => {
      it('returns true for defined values', () => {
        expect(isDefined(0)).toBe(true);
        expect(isDefined('')).toBe(true);
        expect(isDefined(false)).toBe(true);
        expect(isDefined(null)).toBe(true);
      });

      it('returns false for undefined', () => {
        expect(isDefined(undefined)).toBe(false);
      });
    });

    describe('isEmpty', () => {
      it('returns true for empty values', () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty('')).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty({})).toBe(true);
      });

      it('returns false for non-empty values', () => {
        expect(isEmpty('text')).toBe(false);
        expect(isEmpty([1])).toBe(false);
        expect(isEmpty({ key: 'value' })).toBe(false);
        expect(isEmpty(0)).toBe(false);
        expect(isEmpty(false)).toBe(false);
      });
    });
  });

  describe('Number Validation', () => {
    describe('isValidNumber', () => {
      it('returns true for valid numbers', () => {
        expect(isValidNumber(0)).toBe(true);
        expect(isValidNumber(123)).toBe(true);
        expect(isValidNumber(-456)).toBe(true);
        expect(isValidNumber(3.14)).toBe(true);
      });

      it('returns false for NaN and Infinity', () => {
        expect(isValidNumber(NaN)).toBe(false);
        expect(isValidNumber(Infinity)).toBe(false);
        expect(isValidNumber(-Infinity)).toBe(false);
      });

      it('returns false for non-numbers', () => {
        expect(isValidNumber('123')).toBe(false);
        expect(isValidNumber(null)).toBe(false);
        expect(isValidNumber(undefined)).toBe(false);
      });
    });

    describe('isInRange', () => {
      it('returns true for values within range', () => {
        expect(isInRange(5, 0, 10)).toBe(true);
        expect(isInRange(0, 0, 10)).toBe(true);
        expect(isInRange(10, 0, 10)).toBe(true);
      });

      it('returns false for values outside range', () => {
        expect(isInRange(-1, 0, 10)).toBe(false);
        expect(isInRange(11, 0, 10)).toBe(false);
      });

      it('works with negative ranges', () => {
        expect(isInRange(-5, -10, 0)).toBe(true);
        expect(isInRange(-11, -10, 0)).toBe(false);
      });
    });

    describe('isPositive', () => {
      it('returns true for positive numbers', () => {
        expect(isPositive(1)).toBe(true);
        expect(isPositive(0.1)).toBe(true);
        expect(isPositive(1000)).toBe(true);
      });

      it('returns false for zero and negative', () => {
        expect(isPositive(0)).toBe(false);
        expect(isPositive(-1)).toBe(false);
        expect(isPositive(-0.1)).toBe(false);
      });
    });

    describe('isNonNegative', () => {
      it('returns true for non-negative numbers', () => {
        expect(isNonNegative(0)).toBe(true);
        expect(isNonNegative(1)).toBe(true);
        expect(isNonNegative(0.1)).toBe(true);
      });

      it('returns false for negative numbers', () => {
        expect(isNonNegative(-1)).toBe(false);
        expect(isNonNegative(-0.1)).toBe(false);
      });
    });

    describe('isInteger', () => {
      it('returns true for integers', () => {
        expect(isInteger(0)).toBe(true);
        expect(isInteger(123)).toBe(true);
        expect(isInteger(-456)).toBe(true);
      });

      it('returns false for non-integers', () => {
        expect(isInteger(3.14)).toBe(false);
        expect(isInteger(0.1)).toBe(false);
        expect(isInteger(NaN)).toBe(false);
        expect(isInteger(Infinity)).toBe(false);
      });
    });
  });

  describe('Enum Validation', () => {
    enum Color {
      Red = 'RED',
      Green = 'GREEN',
      Blue = 'BLUE',
    }

    enum NumberEnum {
      One = 1,
      Two = 2,
      Three = 3,
    }

    describe('isValidEnum', () => {
      it('validates string enum values', () => {
        expect(isValidEnum('RED', Color)).toBe(true);
        expect(isValidEnum('GREEN', Color)).toBe(true);
        expect(isValidEnum('BLUE', Color)).toBe(true);
      });

      it('rejects invalid enum values', () => {
        expect(isValidEnum('YELLOW', Color)).toBe(false);
        expect(isValidEnum('red', Color)).toBe(false);
        expect(isValidEnum('', Color)).toBe(false);
      });

      it('validates number enum values', () => {
        expect(isValidEnum(1, NumberEnum)).toBe(true);
        expect(isValidEnum(2, NumberEnum)).toBe(true);
        expect(isValidEnum(3, NumberEnum)).toBe(true);
      });

      it('rejects invalid number enum values', () => {
        expect(isValidEnum(4, NumberEnum)).toBe(false);
        expect(isValidEnum(0, NumberEnum)).toBe(false);
      });
    });
  });

  describe('Property Validation', () => {
    const obj = {
      name: 'Zombie',
      health: 100,
      active: true,
    };

    describe('hasProperty', () => {
      it('returns true for existing properties', () => {
        expect(hasProperty(obj, 'name')).toBe(true);
        expect(hasProperty(obj, 'health')).toBe(true);
        expect(hasProperty(obj, 'active')).toBe(true);
      });

      it('returns false for missing properties', () => {
        expect(hasProperty(obj, 'missing')).toBe(false);
        expect(hasProperty(obj, 'attack')).toBe(false);
      });

      it('handles inherited properties', () => {
        expect(hasProperty(obj, 'toString')).toBe(true); // inherited from Object
      });
    });

    describe('hasProperties', () => {
      it('returns true when all properties exist', () => {
        expect(hasProperties(obj, ['name', 'health'])).toBe(true);
        expect(hasProperties(obj, ['name', 'health', 'active'])).toBe(true);
      });

      it('returns false when any property is missing', () => {
        expect(hasProperties(obj, ['name', 'missing'])).toBe(false);
        expect(hasProperties(obj, ['attack', 'defense'])).toBe(false);
      });

      it('returns true for empty array', () => {
        expect(hasProperties(obj, [])).toBe(true);
      });
    });
  });

  describe('Schema Validation', () => {
    const zombieSchema: Schema = {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      health: { type: 'number', required: true, min: 0, max: 100 },
      attack: { type: 'number', required: true, min: 0 },
      level: { type: 'number', required: false, min: 1 },
      active: { type: 'boolean', required: false },
    };

    describe('validateSchema', () => {
      it('validates valid objects', () => {
        const validZombie = {
          id: 'zombie-1',
          name: 'Shambler',
          health: 80,
          attack: 15,
        };

        expect(() => validateSchema(validZombie, zombieSchema)).not.toThrow();
      });

      it('validates objects with optional fields', () => {
        const zombieWithOptional = {
          id: 'zombie-2',
          name: 'Runner',
          health: 60,
          attack: 20,
          level: 5,
          active: true,
        };

        expect(() => validateSchema(zombieWithOptional, zombieSchema)).not.toThrow();
      });

      it('throws ValidationError for missing required fields', () => {
        const invalidZombie = {
          id: 'zombie-3',
          health: 50,
          attack: 10,
        };

        expect(() => validateSchema(invalidZombie, zombieSchema)).toThrow(ValidationError);
        expect(() => validateSchema(invalidZombie, zombieSchema)).toThrow(/name.*required/);
      });

      it('throws ValidationError for wrong types', () => {
        const invalidZombie = {
          id: 'zombie-4',
          name: 'Brute',
          health: 'high', // wrong type
          attack: 30,
        };

        expect(() => validateSchema(invalidZombie, zombieSchema)).toThrow(ValidationError);
        expect(() => validateSchema(invalidZombie, zombieSchema)).toThrow(/health.*number/);
      });

      it('throws ValidationError for values outside min/max', () => {
        const invalidZombie = {
          id: 'zombie-5',
          name: 'Spitter',
          health: 150, // exceeds max
          attack: 25,
        };

        expect(() => validateSchema(invalidZombie, zombieSchema)).toThrow(ValidationError);
        expect(() => validateSchema(invalidZombie, zombieSchema)).toThrow(/health.*100/);
      });

      it('throws ValidationError for negative values when min is 0', () => {
        const invalidZombie = {
          id: 'zombie-6',
          name: 'Bloater',
          health: -10, // below min
          attack: 20,
        };

        expect(() => validateSchema(invalidZombie, zombieSchema)).toThrow(ValidationError);
        expect(() => validateSchema(invalidZombie, zombieSchema)).toThrow(/health.*0/);
      });
    });
  });

  describe('ValidationError', () => {
    it('creates error with message', () => {
      const error = new ValidationError('Invalid value');
      expect(error.message).toBe('Invalid value');
      expect(error.name).toBe('ValidationError');
    });

    it('stores field name', () => {
      const error = new ValidationError('Invalid value', 'username');
      expect(error.field).toBe('username');
    });

    it('stores actual and expected values', () => {
      const error = new ValidationError('Type mismatch', 'age', 'string', 'number');
      expect(error.actual).toBe('string');
      expect(error.expected).toBe('number');
    });

    it('is instance of Error', () => {
      const error = new ValidationError('Test error');
      expect(error instanceof Error).toBe(true);
      expect(error instanceof ValidationError).toBe(true);
    });

    it('has proper stack trace', () => {
      const error = new ValidationError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });
  });

  describe('SchemaValidator Class', () => {
    const schema: Schema = {
      username: { type: 'string', required: true },
      age: { type: 'number', required: true, min: 0, max: 120 },
      email: { type: 'string', required: false },
    };

    const validator = new SchemaValidator(schema);

    it('validates valid data', () => {
      const data = { username: 'player1', age: 25 };
      expect(validator.validate(data)).toBe(true);
      expect(validator.errors).toHaveLength(0);
    });

    it('collects validation errors', () => {
      const invalidData = { username: 'player2', age: 150 };
      expect(validator.validate(invalidData)).toBe(false);
      expect(validator.errors.length).toBeGreaterThan(0);
      expect(validator.errors[0]).toContain('age');
    });

    it('validates and throws on error', () => {
      const invalidData = { age: 25 }; // missing username
      expect(() => validator.validateOrThrow(invalidData)).toThrow(ValidationError);
    });

    it('resets errors between validations', () => {
      validator.validate({ username: 'player3', age: 200 }); // invalid
      expect(validator.errors.length).toBeGreaterThan(0);

      validator.validate({ username: 'player4', age: 30 }); // valid
      expect(validator.errors).toHaveLength(0);
    });
  });
});
