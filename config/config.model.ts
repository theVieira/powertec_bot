export interface iConfig {
  timezone: string;
  target_groups: string[];
  allowed_contacts: string[];
  notice_message: string;
  auto_reply_message: string;
  notice_schedule: Partial<Record<number, iNoticeSchedule | null>>;
  auto_reply_schedule: Partial<Record<number, iAutoReplySchedule[]>>;
  command: {
    pause: string;
    resume: string;
  };
}

export interface iNoticeSchedule {
  start: string;
}

export interface iAutoReplySchedule {
  start: string;
  end: string;
}
