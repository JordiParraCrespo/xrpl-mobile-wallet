export class UserDeletedEvent {
  static readonly eventName = 'user.deleted';

  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}
