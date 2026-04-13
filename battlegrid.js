const DEFAULT_WIDTH = 8;
const DEFAULT_HEIGHT = 6;
const DEFAULT_TILE_SIZE = 5;

export function getTileKey(x, y) {
    return `${x},${y}`;
}

export function createBattleGrid(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, tileSize = DEFAULT_TILE_SIZE) {
    return {
        width,
        height,
        tileSize,
        terrain: {},
        occupied: {}
    };
}

export function setTerrain(grid, x, y, terrain = {}) {
    grid.terrain[getTileKey(x, y)] = terrain;
}

export function placeToken(grid, token) {
    grid.occupied[token.id] = { ...token };
    return grid.occupied[token.id];
}

export function moveToken(grid, tokenId, x, y) {
    if (!grid.occupied[tokenId]) return null;
    grid.occupied[tokenId].x = x;
    grid.occupied[tokenId].y = y;
    return grid.occupied[tokenId];
}

export function getToken(grid, tokenId) {
    return grid.occupied[tokenId] || null;
}

export function getGridDistance(from, to) {
    if (!from || !to) return Infinity;
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

export function isAdjacent(grid, tokenAId, tokenBId, reach = 1) {
    const a = getToken(grid, tokenAId);
    const b = getToken(grid, tokenBId);
    return getGridDistance(a, b) <= reach;
}

export function hasLineOfSight(grid, tokenAId, tokenBId) {
    const a = getToken(grid, tokenAId);
    const b = getToken(grid, tokenBId);
    if (!a || !b) return false;

    const xStep = Math.sign(b.x - a.x);
    const yStep = Math.sign(b.y - a.y);
    let x = a.x;
    let y = a.y;

    while (x !== b.x || y !== b.y) {
        x += xStep;
        y += yStep;
        if (x === b.x && y === b.y) break;
        const terrain = grid.terrain[getTileKey(x, y)];
        if (terrain?.blocksLineOfSight) {
            return false;
        }
    }

    return true;
}

export function canTargetToken(grid, attackerId, targetId, rangeInFeet = 5) {
    const attacker = getToken(grid, attackerId);
    const target = getToken(grid, targetId);
    if (!attacker || !target) return false;

    const maxDistanceInTiles = Math.floor(rangeInFeet / grid.tileSize);
    return getGridDistance(attacker, target) <= maxDistanceInTiles && hasLineOfSight(grid, attackerId, targetId);
}

export function getOpportunityAttackTriggers(grid, moverId, path = []) {
    const mover = getToken(grid, moverId);
    if (!mover || path.length < 2) return [];

    const hostileTokens = Object.values(grid.occupied).filter(token => token.team !== mover.team && token.hp > 0);
    const triggers = [];

    hostileTokens.forEach(hostile => {
        for (let i = 1; i < path.length; i++) {
            const previous = path[i - 1];
            const next = path[i];
            const wasAdjacent = getGridDistance(previous, hostile) <= (hostile.reach || 1);
            const isAdjacentNow = getGridDistance(next, hostile) <= (hostile.reach || 1);
            if (wasAdjacent && !isAdjacentNow) {
                triggers.push({
                    hostileId: hostile.id,
                    moverId,
                    from: previous,
                    to: next
                });
                break;
            }
        }
    });

    return triggers;
}

export function createBattlefieldLayout(playerId, companionIds = [], enemyIds = [], options = {}) {
    const width = options.width || DEFAULT_WIDTH;
    const height = options.height || DEFAULT_HEIGHT;
    const grid = createBattleGrid(width, height, options.tileSize || DEFAULT_TILE_SIZE);

    const allyPositions = [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 1 },
        { x: 1, y: 3 }
    ];
    const enemyRows = [1, 2, 3, 4];

    placeToken(grid, {
        id: playerId,
        x: 1,
        y: 2,
        team: 'allies',
        reach: 1,
        speed: 30
    });

    companionIds.forEach((id, index) => {
        const position = allyPositions[index % allyPositions.length];
        placeToken(grid, {
            id,
            x: position.x,
            y: position.y,
            team: 'allies',
            reach: 1,
            speed: 30
        });
    });

    enemyIds.forEach((id, index) => {
        placeToken(grid, {
            id,
            x: width - 2,
            y: enemyRows[index % enemyRows.length],
            team: 'enemies',
            reach: 1,
            speed: 30
        });
    });

    return grid;
}

export function getMovementCost(grid, x, y) {
    const terrain = grid.terrain[getTileKey(x, y)];
    if (terrain?.difficult) return grid.tileSize * 2;
    return grid.tileSize;
}
