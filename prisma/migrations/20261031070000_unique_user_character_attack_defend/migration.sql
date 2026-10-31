-- Deduplicate before unique constraint: keep earliest Attack per (userId, characterId)
DELETE FROM "Attack"
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY "userId", "characterId"
        ORDER BY "createdAt" ASC, id ASC
      ) AS row_number
    FROM "Attack"
  ) ranked_attacks
  WHERE ranked_attacks.row_number > 1
);

-- Deduplicate before unique constraint: keep earliest Defend per (userId, characterId)
DELETE FROM "Defend"
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY "userId", "characterId"
        ORDER BY "createdAt" ASC, id ASC
      ) AS row_number
    FROM "Defend"
  ) ranked_defends
  WHERE ranked_defends.row_number > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "Attack_userId_characterId_key" ON "Attack"("userId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Defend_userId_characterId_key" ON "Defend"("userId", "characterId");
