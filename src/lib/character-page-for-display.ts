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
  themeName: string | null;
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
  themeName: string | null;
  submitterUserId: string;
  submitterDisplayName: string;
  submitterTeamId: string;
  submitterTeamName: string;
  isHidden: boolean;
};

export type ThemeForAttackDefendSubmission = {
  themeId: string;
  themeName: string;
};

export type CharacterPageForDisplay = {
  characterDetail: CharacterDetailForDisplay;
  viewerActionAvailability: CharacterPageViewerActionAvailability;
  submissionThemesForCurrentWeek: ThemeForAttackDefendSubmission[];
  attacks: CharacterAttackForDisplay[];
  defends: CharacterDefendForDisplay[];
};
