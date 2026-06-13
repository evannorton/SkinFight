import type { AttackDefendShadingValue } from "~/lib/attack-defend-shading";
import type { CharacterDetailForDisplay } from "~/lib/character-detail-for-display";

export type CharacterPageViewerActionAvailability = {
  canShowAttackButton: boolean;
  canShowDefendButton: boolean;
};

export type CharacterAttackForDisplay = {
  id: string;
  fileUrl: string;
  shading: AttackDefendShadingValue;
  submitterUserId: string;
  submitterDisplayName: string;
  submitterTeamId: string;
  submitterTeamName: string;
  isHidden: boolean;
};

export type CharacterDefendForDisplay = {
  id: string;
  fileUrl: string;
  shading: AttackDefendShadingValue;
  submitterUserId: string;
  submitterDisplayName: string;
  submitterTeamId: string;
  submitterTeamName: string;
  isHidden: boolean;
};

export type CharacterPageForDisplay = {
  characterDetail: CharacterDetailForDisplay;
  viewerActionAvailability: CharacterPageViewerActionAvailability;
  attacks: CharacterAttackForDisplay[];
  defends: CharacterDefendForDisplay[];
};
