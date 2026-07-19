import assert from "node:assert/strict";
import { test } from "node:test";
import { registerPlugin } from "@capacitor/core";
import { toStoredDate } from "../src/utils/dateUtils.ts";

let pendingIds: number[] = [];
let scheduledIds: number[] = [];

// Register a fake device implementation before loading the notification utilities.
registerPlugin("LocalNotifications", {
  web: {
    getPending: async () => ({ notifications: pendingIds.map((id) => ({ id })) }),
    cancel: async ({ notifications }: { notifications: { id: number }[] }) => {
      const cancelled = new Set(notifications.map(({ id }) => id));
      pendingIds = pendingIds.filter((id) => !cancelled.has(id));
    },
    checkPermissions: async () => ({ display: "granted" }),
    schedule: async ({ notifications }: { notifications: { id: number }[] }) => {
      scheduledIds = notifications.map(({ id }) => id);
    },
  },
});

const {
  buildTacoReminders, buildNonoReminders, buildReminderPostReminders,
  cancelRetiredReminders, cancelAllManagedReminders, rescheduleReminders, isTacoManagedId,
} = await import("../src/utils/localNotifications.ts");

test("retired notifications are cancelled without touching active reminders or unrelated IDs", async () => {
  pendingIds = [42, 101, 201, 10_000, 599_999, 600_000, 1_099_999, 1_100_000];
  await cancelRetiredReminders();
  assert.deepEqual(pendingIds, [42, 101, 201, 10_000, 599_999, 1_100_000]);
});

test("disabling notifications also removes reminders left by older app versions", async () => {
  pendingIds = [42, 101, 204, 10_000, 600_000, 1_100_000];
  await cancelAllManagedReminders();
  assert.deepEqual(pendingIds, [42, 1_100_000]);
});

test("care and task reminders remain available after removing the calendar", async () => {
  const day = new Date(2090, 8, 17);
  const date = toStoredDate(day);
  const taco = buildTacoReminders({ vermifugeReminder: date, antiPuceReminder: date, annualVaccineReminder: date });
  const nono = buildNonoReminders({ checkupReminder: date, vaccineReminder: date, vitaminReminder: date, administrativeReminder: date });
  assert.deepEqual(taco.map(({ id }) => id), [101, 102, 103]);
  assert.deepEqual(nono.map(({ id }) => id), [201, 202, 203, 204]);
  const tasks = buildReminderPostReminders([{
    _id: "invoice", user: "user", username: "Test", title: "Facture", body: "",
    priorityColor: 0, status: "todo", amount: 20, dueDate: day,
  }]);
  assert.equal(tasks.length, 1);
  assert.ok(tasks[0].id >= 10_000 && tasks[0].id < 510_000);
  pendingIds = [101, 102, 201, tasks[0].id];
  await rescheduleReminders(taco, isTacoManagedId);
  assert.deepEqual(pendingIds, [201, tasks[0].id]);
  assert.deepEqual(scheduledIds, [101, 102, 103]);
});
