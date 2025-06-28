import { config } from "../../config/config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const { auto_reply_schedule, timezone: timezone_config } = config;

dayjs.extend(utc);
dayjs.extend(timezone);

export function ItsOnReplySchedule(): boolean {
  const now = dayjs().tz(timezone_config);
  const weekDay = now.day();
  const schedules = auto_reply_schedule[weekDay];

  if (!schedules || schedules.length === 0) return false;

  return schedules.some((schedule) => {
    const [hStart, mStart] = schedule.start.split(":").map(Number);

    const [hEnd, mEnd] = schedule.end.split(":").map(Number);

    const startTime = now
      .set("hour", hStart)
      .set("minute", mStart)
      .set("second", 0)
      .set("millisecond", 0);

    let endTime = now
      .set("hour", hEnd)
      .set("minute", mEnd)
      .set("second", 0)
      .set("millisecond", 0);

    if (endTime.isBefore(startTime)) endTime = endTime.add(1, "day");

    const itsOnSchedule = now.isAfter(startTime) && now.isBefore(endTime);

    return itsOnSchedule;
  });
}
