export type CharacterDetailForDisplay = {
  id: string;
  name: string;
  fileUrl: string;
  description: string | null;
  externalSkinUrl: string | null;
  userId: string;
  userDisplayName: string;
  teamId: string;
  teamName: string;
  eventId: string;
  eventName: string;
  isHidden: boolean;
};
