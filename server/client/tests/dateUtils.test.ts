import assert from "node:assert/strict";
import { test } from "node:test";
import { parseStoredDate, startOfDay, toStoredDate } from "../src/utils/dateUtils.ts";

test("invalid stored dates do not roll over into a different month", () => {
  for (const value of [undefined, null, "", "31/02/2026", "29/02/2026", "00/09/2026", "17/13/2026", "2026-09-17"]) {
    assert.equal(parseStoredDate(value), null);
  }
  assert.equal(toStoredDate(parseStoredDate("29/02/2028")), "29/02/2028");
  assert.equal(toStoredDate(parseStoredDate("7/8/2026")), "07/08/2026");
});

test("date formatting and day boundaries preserve the local calendar day", () => {
  const date = new Date(2026, 8, 17, 23, 45);
  assert.equal(toStoredDate(date), "17/09/2026");
  assert.equal(toStoredDate(startOfDay(date)), "17/09/2026");
  assert.equal(startOfDay(date).getHours(), 0);
  assert.equal(date.getHours(), 23);
  assert.equal(toStoredDate(new Date(NaN)), "");
});
