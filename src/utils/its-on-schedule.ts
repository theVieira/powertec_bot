import { config } from "../../config/config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const { auto_reply_schedule, timezone: timezone_config } = config;

dayjs.extend(utc);
dayjs.extend(timezone);

export function ItsOnReplySchedule(): boolean {
  const now = dayjs().tz(timezone_config);
  const today = now.day();
  const yesterday = (today + 6) % 7;

  const todaySchedules = auto_reply_schedule[today] || [];
  const yesterdaySchedules = auto_reply_schedule[yesterday] || [];

  const isTodayOn = todaySchedules.some((schedule) =>
    isNowInSchedule(now, schedule, false)
  );

  const isYesterdayOn = yesterdaySchedules.some((schedule) =>
    isNowInSchedule(now, schedule, true)
  );

  return isTodayOn || isYesterdayOn;
}

function isNowInSchedule(
  now: dayjs.Dayjs,
  schedule: { start: string; end: string },
  isYesterday: boolean
): boolean {
  const [hStart, mStart] = schedule.start.split(":").map(Number);
  const [hEnd, mEnd] = schedule.end.split(":").map(Number);

  let startTime = now
    .set("hour", hStart)
    .set("minute", mStart)
    .set("second", 0)
    .set("millisecond", 0);

  let endTime = now
    .set("hour", hEnd)
    .set("minute", mEnd)
    .set("second", 0)
    .set("millisecond", 0);

  if (isYesterday) {
    // Para ontem, ajusta start/endTime para ontem
    startTime = startTime.subtract(1, "day");
    endTime = endTime.subtract(1, "day");
  }

  if (endTime.isBefore(startTime)) {
    endTime = endTime.add(1, "day");
  }

  return now.isAfter(startTime) && now.isBefore(endTime);
}
