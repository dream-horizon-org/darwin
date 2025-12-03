export type INotificationPreference =
  | 'notification_preference.on_success'
  | 'notification_preference.on_start'
  | 'notification_preference.on_fail'
  | 'notification_preference.on_skip'

export type TaskNotificationPreferencePath =
  `tasks.${number}.notification_preference.${'on_fail'}`
