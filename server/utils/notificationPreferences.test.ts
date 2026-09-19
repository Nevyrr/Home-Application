import assert from "node:assert/strict";
import { test } from "node:test";
import User from "../models/UserModel.js";

process.env.DB_URI ||= "mongodb://localhost/home-application-test";
process.env.SECRET ||= "test-secret-with-at-least-thirty-two-characters";

const { getReminderRecipients, sendReminderEmails } = await import("./reminderEmails.js");

const mockOptedInUsers = (users: Array<{ email: string }>) => {
  const originalFind = User.find;
  let receivedFilter: unknown;

  User.find = ((filter: unknown) => {
    receivedFilter = filter;
    return {
      select: (selection: string) => {
        assert.equal(selection, "email");
        return { lean: async () => users };
      },
    };
  }) as typeof User.find;

  return {
    getFilter: () => receivedFilter,
    restore: () => {
      User.find = originalFind;
    },
  };
};

test("new accounts have notifications disabled by default", async () => {
  const user = new User({ name: "Nouveau", email: "nouveau@example.com", password: "secret" });
  await user.validate();
  assert.equal(user.receiveEmail, false);
});

test("reminder recipients only come from users who enabled notifications", async () => {
  process.env.EMAIL_RECIPIENT_1 = "legacy@example.com";
  process.env.EMAIL_RECIPIENT_2 = "legacy2@example.com";
  const mock = mockOptedInUsers([
    { email: " Active@Example.com " },
    { email: "active@example.com" },
  ]);

  try {
    assert.deepEqual(await getReminderRecipients(), ["active@example.com"]);
    assert.deepEqual(mock.getFilter(), { receiveEmail: true });
  } finally {
    mock.restore();
    delete process.env.EMAIL_RECIPIENT_1;
    delete process.env.EMAIL_RECIPIENT_2;
  }
});

test("email reminders are skipped cleanly when everyone opted out", async () => {
  const mock = mockOptedInUsers([]);

  try {
    assert.deepEqual(await sendReminderEmails("Rappel", "Message"), {
      recipients: [],
      sent: 0,
      failed: 0,
    });
  } finally {
    mock.restore();
  }
});
