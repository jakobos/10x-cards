import { describe, it, expect } from "vitest";
import { validatePassword, formatDate } from "@/lib/helpers";

describe("validatePassword", () => {
  describe("Valid passwords", () => {
    it("should accept valid password with minimum requirements", () => {
      expect(validatePassword("Password1")).toBeNull();
    });

    it("should accept password with special characters", () => {
      expect(validatePassword("Pass123!@#")).toBeNull();
    });

    it("should accept password with exactly 8 characters", () => {
      expect(validatePassword("Pass123A")).toBeNull();
    });

    it("should accept password with multiple uppercase letters", () => {
      expect(validatePassword("PASSWORD123")).toBeNull();
    });

    it("should accept password with multiple digits", () => {
      expect(validatePassword("Pass123456")).toBeNull();
    });

    it("should accept very long password", () => {
      const longPassword = "P".repeat(50) + "123";
      expect(validatePassword(longPassword)).toBeNull();
    });

    it("should accept password with mixed case and numbers", () => {
      expect(validatePassword("MyP4ssw0rd")).toBeNull();
    });

    it("should accept password with unicode characters", () => {
      expect(validatePassword("Pąssw0rd123")).toBeNull();
    });
  });

  describe("Length validation", () => {
    it("should reject password shorter than 8 characters", () => {
      const result = validatePassword("Pass1");
      expect(result).toBe("Hasło musi mieć minimum 8 znaków");
    });

    it("should reject password with exactly 7 characters", () => {
      const result = validatePassword("Pass12A");
      expect(result).toBe("Hasło musi mieć minimum 8 znaków");
    });

    it("should reject empty password", () => {
      const result = validatePassword("");
      expect(result).toBe("Hasło musi mieć minimum 8 znaków");
    });

    it("should reject single character password", () => {
      const result = validatePassword("P");
      expect(result).toBe("Hasło musi mieć minimum 8 znaków");
    });
  });

  describe("Uppercase letter validation", () => {
    it("should reject password without uppercase letter", () => {
      const result = validatePassword("password123");
      expect(result).toBe("Hasło musi zawierać co najmniej jedną wielką literę");
    });

    it("should reject password with only lowercase and digits", () => {
      const result = validatePassword("password123");
      expect(result).toBe("Hasło musi zawierać co najmniej jedną wielką literę");
    });

    it("should reject password with special characters but no uppercase", () => {
      const result = validatePassword("password123!@#");
      expect(result).toBe("Hasło musi zawierać co najmniej jedną wielką literę");
    });
  });

  describe("Digit validation", () => {
    it("should reject password without digit", () => {
      const result = validatePassword("PasswordABC");
      expect(result).toBe("Hasło musi zawierać co najmniej jedną cyfrę");
    });

    it("should reject password with only uppercase and lowercase", () => {
      const result = validatePassword("PasswordABC");
      expect(result).toBe("Hasło musi zawierać co najmniej jedną cyfrę");
    });

    it("should reject password with special characters but no digit", () => {
      const result = validatePassword("Password!@#");
      expect(result).toBe("Hasło musi zawierać co najmniej jedną cyfrę");
    });
  });

  describe("Multiple validation failures", () => {
    it("should return first validation error when multiple rules fail", () => {
      // Missing length, uppercase, and digit - should return length error first
      const result = validatePassword("pass");
      expect(result).toBe("Hasło musi mieć minimum 8 znaków");
    });

    it("should return uppercase error when length is valid but no uppercase or digit", () => {
      const result = validatePassword("password");
      expect(result).toBe("Hasło musi zawierać co najmniej jedną wielką literę");
    });

    it("should return digit error when length and uppercase valid but no digit", () => {
      const result = validatePassword("Password");
      expect(result).toBe("Hasło musi zawierać co najmniej jedną cyfrę");
    });
  });

  describe("Edge cases", () => {
    it("should handle password with spaces", () => {
      const result = validatePassword("Pass 123");
      expect(result).toBeNull();
    });

    it("should handle password with only spaces and valid chars", () => {
      const result = validatePassword("   Pass123");
      expect(result).toBeNull();
    });

    it("should reject password of only spaces", () => {
      const result = validatePassword("        ");
      expect(result).toBe("Hasło musi zawierać co najmniej jedną wielką literę");
    });
  });
});

describe("formatDate", () => {
  describe("Basic formatting", () => {
    it("should format date to Polish locale with correct pattern", () => {
      const date = "2024-10-18T12:30:00Z";
      const formatted = formatDate(date);

      // Format: DD.MM.YYYY, HH:MM
      expect(formatted).toMatch(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
    });

    it("should format specific date correctly", () => {
      const date = "2024-01-15T09:05:00Z";
      const formatted = formatDate(date);

      expect(formatted).toContain("15.01.2024");
    });

    it("should format date with time component", () => {
      const date = "2024-06-20T14:30:00Z";
      const formatted = formatDate(date);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("2024");
    });
  });

  describe("Time edge cases", () => {
    it("should handle midnight times", () => {
      const date = "2024-01-15T00:00:00Z";
      const formatted = formatDate(date);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2024");
    });

    it("should handle end of day times", () => {
      const date = "2024-01-15T23:59:59Z";
      const formatted = formatDate(date);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2024");
    });

    it("should handle noon times", () => {
      const date = "2024-06-15T12:00:00Z";
      const formatted = formatDate(date);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain("15.06.2024");
    });
  });

  describe("Date edge cases", () => {
    it("should handle leap year dates", () => {
      const date = "2024-02-29T12:00:00Z";
      const formatted = formatDate(date);

      expect(formatted).toContain("29.02.2024");
    });

    it("should handle first day of year", () => {
      const date = "2024-01-01T00:00:00Z";
      const formatted = formatDate(date);

      expect(formatted).toContain("01.01.2024");
    });

    it("should handle last day of year", () => {
      const date = "2024-12-31T12:00:00Z";
      const formatted = formatDate(date);

      expect(formatted).toContain("31.12.2024");
    });
  });

  describe("Padding", () => {
    it("should pad single digit days", () => {
      const date = "2024-01-05T12:00:00Z";
      const formatted = formatDate(date);

      expect(formatted).toContain("05.01.2024");
    });

    it("should pad single digit months", () => {
      const date = "2024-03-15T12:00:00Z";
      const formatted = formatDate(date);

      expect(formatted).toContain("15.03.2024");
    });

    it("should pad both single digit day and month", () => {
      const date = "2024-05-07T12:00:00Z";
      const formatted = formatDate(date);

      expect(formatted).toContain("07.05.2024");
    });
  });

  describe("Various dates", () => {
    it("should format current date without error", () => {
      const now = new Date().toISOString();
      const formatted = formatDate(now);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
    });

    it("should format date from past", () => {
      const date = "2020-03-15T08:30:00Z";
      const formatted = formatDate(date);

      expect(formatted).toContain("2020");
      expect(formatted).toBeTruthy();
    });

    it("should format date from future", () => {
      const date = "2030-12-25T18:00:00Z";
      const formatted = formatDate(date);

      expect(formatted).toContain("2030");
      expect(formatted).toBeTruthy();
    });
  });

  describe("Different time zones", () => {
    it("should handle UTC time", () => {
      const date = "2024-06-15T12:00:00Z";
      const formatted = formatDate(date);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2024");
    });

    it("should handle date with timezone offset", () => {
      const date = "2024-06-15T12:00:00+02:00";
      const formatted = formatDate(date);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2024");
    });

    it("should handle date without timezone", () => {
      const date = "2024-06-15T12:00:00";
      const formatted = formatDate(date);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2024");
    });
  });

  describe("Format consistency", () => {
    it("should return consistent format for same date", () => {
      const date = "2024-10-18T12:30:00Z";
      const formatted1 = formatDate(date);
      const formatted2 = formatDate(date);

      expect(formatted1).toBe(formatted2);
    });

    it("should include comma separator between date and time", () => {
      const date = "2024-10-18T12:30:00Z";
      const formatted = formatDate(date);

      expect(formatted).toContain(",");
    });

    it("should include colon in time part", () => {
      const date = "2024-10-18T12:30:00Z";
      const formatted = formatDate(date);

      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });
});
