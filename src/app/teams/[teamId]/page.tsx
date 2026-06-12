import { Box, Heading } from "@radix-ui/themes";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import { TeamMembersList } from "~/app/teams/[teamId]/team-members-list";
import { db } from "~/server/db";

type TeamPageProps = {
  params: Promise<{ teamId: string }>;
};

export async function generateMetadata(
  props: TeamPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const team = await db.team.findUnique({
    where: { id: params.teamId },
    select: { name: true },
  });

  const teamName = team?.name ?? "Team";
  return {
    title: `${teamName} · SkinFight`,
  };
}

type TeamMember = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

function buildUserDisplayName(userName: string | null, userEmail: string | null): string {
  if (userName !== null && userName !== "") {
    return userName;
  }
  if (userEmail !== null) {
    return userEmail;
  }
  return "Unknown User";
}

export default async function TeamPage(
  props: TeamPageProps,
): Promise<ReactElement> {
  const params = await props.params;
  const teamId = params.teamId;

  const team = await db.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      eventParticipations: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (team === null) {
    notFound();
  }

  const seenUserIds = new Set<string>();
  const teamMembers: TeamMember[] = [];

  for (const participation of team.eventParticipations) {
    const userId = participation.user.id;
    if (seenUserIds.has(userId) === false) {
      seenUserIds.add(userId);
      teamMembers.push({
        id: participation.user.id,
        name: participation.user.name,
        email: participation.user.email,
        image: participation.user.image,
      });
    }
  }

  teamMembers.sort((memberA, memberB) => {
    const nameA = buildUserDisplayName(memberA.name, memberA.email).toLowerCase();
    const nameB = buildUserDisplayName(memberB.name, memberB.email).toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  return (
    <Box px="6" py="6">
      <Heading as="h1" size="8" mb="6">
        {team.name}
      </Heading>

      <TeamMembersList teamMembers={teamMembers} teamId={teamId} />
    </Box>
  );
}
