import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCareUpdate, buildCareDateUpdate, getCareReminderUpdates } from "./careSchedule.js";
import TacoModel from "../models/TacoModel.js";
import NonoModel from "../models/NonoModel.js";

test("a given care saves both dates and its own interval together", () => {
  const cases = [
    ["taco", "vermifuge", "vermifuge"],
    ["taco", "antipuce", "antiPuce"],
    ["taco", "vaccine", "annualVaccine"],
    ["nono", "vaccine", "vaccine"],
    ["nono", "vitamin", "vitamin"],
  ] as const;
  for (const [profile, care, prefix] of cases) {
    assert.deepEqual(buildCareUpdate(profile, care, 3, "18/09/2026"), {
      [`${prefix}Date`]: "18/09/2026",
      [`${prefix}Reminder`]: "18/12/2026",
      [`${prefix}IntervalMonths`]: 3,
    });
  }
});

test("changing either the interval or the application date recalculates the reminder for every care", () => {
  const cases = [
    ["taco", "vermifuge", "vermifuge"],
    ["taco", "antipuce", "antiPuce"],
    ["taco", "vaccine", "annualVaccine"],
    ["nono", "vaccine", "vaccine"],
    ["nono", "vitamin", "vitamin"],
  ] as const;
  for (const [profile, care, prefix] of cases) {
    const current = buildCareUpdate(profile, care, 3, "17/06/2026");
    assert.equal(current[`${prefix}Reminder`], "17/09/2026");
    const intervalUpdate = buildCareUpdate(profile, care, 6, undefined, current);
    assert.equal(intervalUpdate[`${prefix}Reminder`], "17/12/2026");
    assert.equal(intervalUpdate[`${prefix}Date`], undefined);
    Object.assign(current, intervalUpdate);
    const dateUpdate = buildCareDateUpdate(profile, `${prefix}Date`, "31/08/2026", current);
    assert.equal(dateUpdate[`${prefix}Reminder`], "28/02/2027");
  }
});

test("a missing or cleared application date leaves no automatic reminder", () => {
  assert.deepEqual(buildCareUpdate("taco", "vermifuge", 6), {
    vermifugeIntervalMonths: 6, vermifugeReminder: "",
  });
  const current = buildCareUpdate("nono", "vaccine", 3, "17/06/2026");
  assert.deepEqual(buildCareDateUpdate("nono", "vaccineDate", "", current), {
    vaccineIntervalMonths: 3, vaccineDate: "", vaccineReminder: "",
  });
  assert.deepEqual(buildCareDateUpdate("nono", "vitaminDate", "17/06/2026", {}), {
    vitaminDate: "17/06/2026", vitaminReminder: "",
  });
});

test("loading existing records corrects stale reminders without changing application dates", () => {
  assert.deepEqual(getCareReminderUpdates("taco", {
    antiPuceDate: "17/06/2026", antiPuceIntervalMonths: 3, antiPuceReminder: "01/01/2020",
    annualVaccineDate: "17/06/2026", annualVaccineIntervalMonths: 12, annualVaccineReminder: "17/06/2027",
  }), { antiPuceReminder: "17/09/2026" });
  assert.deepEqual(getCareReminderUpdates("nono", {
    vitaminDate: "", vitaminIntervalMonths: 1, vitaminReminder: "17/09/2026",
  }), { vitaminReminder: "" });
  assert.deepEqual(getCareReminderUpdates("nono", { vaccineReminder: "17/09/2026" }), {});
});

test("unrelated date fields keep their existing behavior", () => {
  assert.deepEqual(buildCareDateUpdate("nono", "checkupDate", "17/09/2026", {}), {
    checkupDate: "17/09/2026",
  });
});

test("month arithmetic handles short months, leap years and year boundaries", () => {
  for (const [date, months, expected] of [
    ["31/01/2026", 1, "28/02/2026"],
    ["31/01/2028", 1, "29/02/2028"],
    ["29/02/2028", 12, "28/02/2029"],
    ["31/08/2026", 1, "30/09/2026"],
    ["31/12/2026", 2, "28/02/2027"],
    ["30/03/2026", 1, "30/04/2026"],
  ] as const) {
    assert.equal(buildCareUpdate("nono", "vaccine", months, date).vaccineReminder, expected);
  }
});

test("invalid intervals, dates and care names are rejected", () => {
  const badRequest = (operation: () => unknown) => assert.throws(operation, { statusCode: 400 });
  for (const interval of [undefined, null, "3", 0, -1, 1.5, NaN, Infinity, 1201]) {
    badRequest(() => buildCareUpdate("taco", "vermifuge", interval, "18/09/2026"));
  }
  for (const date of [null, "2026-09-18", "31/02/2026", "29/02/2026", "00/12/2026", "01/13/2026", "31/12/9999"]) {
    badRequest(() => buildCareUpdate("nono", "vitamin", 1, date));
  }
  for (const care of ["notes", "__proto__", "constructor", "vermifuge"]) {
    badRequest(() => buildCareUpdate("nono", care, 1));
  }
});

test("legacy records accept unset intervals and models retain new care fields", async () => {
  const nono = new NonoModel();
  await nono.validate();
  assert.equal(nono.vaccineIntervalMonths, null);
  assert.equal(nono.vitaminDate, "");
  const taco = new TacoModel();
  await taco.validate();
  assert.equal(taco.vermifugeIntervalMonths, null);
  taco.set(buildCareUpdate("taco", "vermifuge", 3));
  await taco.validate();
  assert.equal(taco.vermifugeReminder, "");
  nono.set(buildCareUpdate("nono", "vitamin", 2, "18/09/2026"));
  taco.set(buildCareUpdate("taco", "antipuce", 3, "18/09/2026"));
  await nono.validate();
  await taco.validate();
  assert.equal(nono.toObject().vitaminDate, "18/09/2026");
  assert.equal(nono.toObject().vitaminIntervalMonths, 2);
  assert.equal(taco.toObject().antiPuceIntervalMonths, 3);
  nono.vaccineIntervalMonths = 1.5;
  await assert.rejects(nono.validate());
});
