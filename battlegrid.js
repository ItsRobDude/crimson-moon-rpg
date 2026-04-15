const DEFAULT_WIDTH = 8;
const DEFAULT_HEIGHT = 6;
const DEFAULT_TILE_SIZE = 5;
const CARDINAL_FACINGS = {
    north: { id: 'north', x: 0, y: -1, label: 'North' },
    east: { id: 'east', x: 1, y: 0, label: 'East' },
    south: { id: 'south', x: 0, y: 1, label: 'South' },
    west: { id: 'west', x: -1, y: 0, label: 'West' }
};

export function getTileKey(x, y) {
    return `${x},${y}`;
}

export function createBattleGrid(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, tileSize = DEFAULT_TILE_SIZE) {
    return {
        width,
        height,
        tileSize,
        terrain: {},
        tileEffects: {},
        zoneEffects: {},
        occupied: {}
    };
}

export function feetToTiles(grid, feet) {
    return Math.max(1, Math.floor(feet / grid.tileSize));
}

export function tilesToFeet(grid, tiles) {
    return tiles * grid.tileSize;
}

export function isWithinGrid(grid, x, y) {
    return x >= 0 && x < grid.width && y >= 0 && y < grid.height;
}

function normalizePoint(point) {
    if (!point) return null;
    if (Number.isInteger(point.x) && Number.isInteger(point.y)) {
        return { x: point.x, y: point.y };
    }
    return null;
}

export function getFacingDirections() {
    return Object.values(CARDINAL_FACINGS).map((direction) => ({ ...direction }));
}

export function normalizeFacing(facing) {
    if (!facing) return CARDINAL_FACINGS.east;
    if (typeof facing === 'string') {
        return CARDINAL_FACINGS[facing.toLowerCase()] || CARDINAL_FACINGS.east;
    }
    const matched = Object.values(CARDINAL_FACINGS).find((direction) => direction.x === facing.x && direction.y === facing.y);
    return matched || CARDINAL_FACINGS.east;
}

export function setTerrain(grid, x, y, terrain = {}) {
    grid.terrain[getTileKey(x, y)] = terrain;
}

export function setTileEffect(grid, x, y, effect = {}) {
    const key = getTileKey(x, y);
    if (!grid.tileEffects[key]) {
        grid.tileEffects[key] = [];
    }
    grid.tileEffects[key].push({ ...effect });
    return grid.tileEffects[key];
}

export function setZoneEffect(grid, effect = {}) {
    const id = effect.id || `zone_${Object.keys(grid.zoneEffects || {}).length + 1}`;
    const template = effect.template || 'radius';
    const origin = effect.origin || effect.center || null;
    const tiles = getTemplateTiles(grid, {
        template,
        origin,
        sizeFeet: effect.sizeFeet || effect.radiusFeet || grid.tileSize,
        facing: effect.facing,
        lengthFeet: effect.lengthFeet || effect.sizeFeet || effect.radiusFeet || grid.tileSize
    });

    grid.zoneEffects[id] = {
        ...effect,
        id,
        template,
        tiles: tiles.map((tile) => ({ x: tile.x, y: tile.y })),
        tileKeys: tiles.map((tile) => getTileKey(tile.x, tile.y))
    };

    return grid.zoneEffects[id];
}

export function clearZoneEffect(grid, effectId = null) {
    if (!grid.zoneEffects) return;
    if (!effectId) {
        grid.zoneEffects = {};
        return;
    }
    delete grid.zoneEffects[effectId];
}

export function clearTileEffects(grid, x, y, effectId = null) {
    const key = getTileKey(x, y);
    if (!grid.tileEffects[key]) return;

    if (!effectId) {
        delete grid.tileEffects[key];
        return;
    }

    grid.tileEffects[key] = grid.tileEffects[key].filter(effect => effect.id !== effectId);
    if (grid.tileEffects[key].length === 0) {
        delete grid.tileEffects[key];
    }
}

export function getTileEffects(grid, x, y) {
    const key = getTileKey(x, y);
    const directEffects = grid.tileEffects[key] || [];
    const zoneEffects = Object.values(grid.zoneEffects || {}).filter((effect) => effect.tileKeys?.includes(key));
    return [...directEffects, ...zoneEffects];
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

export function getGridDistanceFeet(grid, from, to) {
    return getGridDistance(from, to) * grid.tileSize;
}

export function getRangeDistance(from, to) {
    if (!from || !to) return Infinity;
    return Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
}

export function getRangeDistanceFeet(grid, from, to) {
    return getRangeDistance(from, to) * grid.tileSize;
}

export function isAdjacent(grid, tokenAId, tokenBId, reach = 1) {
    const a = getToken(grid, tokenAId);
    const b = getToken(grid, tokenBId);
    return getRangeDistance(a, b) <= reach;
}

function getIntermediateLineTiles(fromPoint, toPoint) {
    const a = normalizePoint(fromPoint);
    const b = normalizePoint(toPoint);
    if (!a || !b) return [];

    const tiles = [];
    let x = a.x;
    let y = a.y;
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);
    const sx = a.x < b.x ? 1 : -1;
    const sy = a.y < b.y ? 1 : -1;
    let err = dx - dy;

    while (x !== b.x || y !== b.y) {
        const doubleErr = err * 2;
        if (doubleErr > -dy) {
            err -= dy;
            x += sx;
        }
        if (doubleErr < dx) {
            err += dx;
            y += sy;
        }
        if (x === b.x && y === b.y) break;
        tiles.push({ x, y });
    }

    return tiles;
}

export function hasLineOfSightBetweenPoints(grid, fromPoint, toPoint) {
    const a = normalizePoint(fromPoint);
    const b = normalizePoint(toPoint);
    if (!a || !b) return false;

    for (const tile of getIntermediateLineTiles(a, b)) {
        const terrain = grid.terrain[getTileKey(tile.x, tile.y)];
        if (terrain?.blocksLineOfSight) {
            return false;
        }
    }

    return true;
}

export function hasLineOfSight(grid, tokenAId, tokenBId) {
    const a = getToken(grid, tokenAId);
    const b = getToken(grid, tokenBId);
    return hasLineOfSightBetweenPoints(grid, a, b);
}

export function getCoverBetweenPoints(grid, fromPoint, toPoint) {
    const a = normalizePoint(fromPoint);
    const b = normalizePoint(toPoint);
    if (!a || !b) return 'full';
    let cover = 'none';

    for (const tile of getIntermediateLineTiles(a, b)) {
        const terrain = grid.terrain[getTileKey(tile.x, tile.y)];
        if (!terrain) continue;
        if (terrain.blocksLineOfSight || terrain.cover === 'full' || terrain.coverBonus >= 5) {
            return 'full';
        }
        if (terrain.cover === 'three_quarters' || terrain.coverBonus >= 5) {
            cover = 'three_quarters';
        } else if (terrain.cover === 'half' || terrain.coverBonus >= 2) {
            cover = cover === 'none' ? 'half' : cover;
        }
    }

    return cover;
}

export function getCoverBetween(grid, attackerId, targetId) {
    return getCoverBetweenPoints(grid, getToken(grid, attackerId), getToken(grid, targetId));
}

export function canTargetToken(grid, attackerId, targetId, rangeInFeet = 5) {
    const attacker = getToken(grid, attackerId);
    const target = getToken(grid, targetId);
    if (!attacker || !target) return false;

    const maxDistanceInTiles = feetToTiles(grid, rangeInFeet);
    return getRangeDistance(attacker, target) <= maxDistanceInTiles && hasLineOfSight(grid, attackerId, targetId);
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
            const wasAdjacent = getRangeDistance(previous, hostile) <= (hostile.reach || 1);
            const isAdjacentNow = getRangeDistance(next, hostile) <= (hostile.reach || 1);
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

export function inferFacing(fromPoint, toPoint) {
    const from = normalizePoint(fromPoint);
    const to = normalizePoint(toPoint);
    if (!from || !to) return CARDINAL_FACINGS.east;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx >= 0 ? CARDINAL_FACINGS.east : CARDINAL_FACINGS.west;
    }
    return dy >= 0 ? CARDINAL_FACINGS.south : CARDINAL_FACINGS.north;
}

function dedupeTiles(tiles = []) {
    const seen = new Set();
    return tiles.filter((tile) => {
        const key = getTileKey(tile.x, tile.y);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function getLineTiles(grid, originPoint, lengthFeet, facing) {
    const origin = normalizePoint(originPoint);
    const direction = normalizeFacing(facing);
    const tiles = [];
    const lengthTiles = feetToTiles(grid, lengthFeet);

    for (let step = 1; step <= lengthTiles; step++) {
        const tile = {
            x: origin.x + (direction.x * step),
            y: origin.y + (direction.y * step)
        };
        if (isWithinGrid(grid, tile.x, tile.y)) {
            tiles.push(tile);
        }
    }

    return tiles;
}

function getConeTiles(grid, originPoint, lengthFeet, facing) {
    const origin = normalizePoint(originPoint);
    const direction = normalizeFacing(facing);
    const lengthTiles = feetToTiles(grid, lengthFeet);
    const tiles = [];

    for (let step = 1; step <= lengthTiles; step++) {
        const lateralLimit = Math.floor(step / 2);
        if (direction.x !== 0) {
            const x = origin.x + (direction.x * step);
            for (let lateral = -lateralLimit; lateral <= lateralLimit; lateral++) {
                const tile = { x, y: origin.y + lateral };
                if (isWithinGrid(grid, tile.x, tile.y)) {
                    tiles.push(tile);
                }
            }
        } else {
            const y = origin.y + (direction.y * step);
            for (let lateral = -lateralLimit; lateral <= lateralLimit; lateral++) {
                const tile = { x: origin.x + lateral, y };
                if (isWithinGrid(grid, tile.x, tile.y)) {
                    tiles.push(tile);
                }
            }
        }
    }

    return tiles;
}

function getCubeTiles(grid, originPoint, sizeFeet, facing) {
    const origin = normalizePoint(originPoint);
    const direction = normalizeFacing(facing);
    const sizeTiles = feetToTiles(grid, sizeFeet);
    const tiles = [];

    for (let depth = 1; depth <= sizeTiles; depth++) {
        for (let lateral = 0; lateral < sizeTiles; lateral++) {
            const offset = lateral - Math.floor(sizeTiles / 2);
            const tile = direction.x !== 0
                ? { x: origin.x + (direction.x * depth), y: origin.y + offset }
                : { x: origin.x + offset, y: origin.y + (direction.y * depth) };
            if (isWithinGrid(grid, tile.x, tile.y)) {
                tiles.push(tile);
            }
        }
    }

    return tiles;
}

export function getTemplateTiles(grid, spec = {}) {
    const origin = normalizePoint(spec.origin || spec.center);
    if (!grid || !origin) return [];

    const template = spec.template || 'single';
    const sizeFeet = spec.sizeFeet || spec.radiusFeet || spec.lengthFeet || grid.tileSize;

    if (template === 'single') {
        return [origin];
    }

    if (template === 'radius' || template === 'burst') {
        const radiusTiles = feetToTiles(grid, sizeFeet);
        const tiles = [];
        for (let x = origin.x - radiusTiles; x <= origin.x + radiusTiles; x++) {
            for (let y = origin.y - radiusTiles; y <= origin.y + radiusTiles; y++) {
                if (!isWithinGrid(grid, x, y)) continue;
                if (getRangeDistance(origin, { x, y }) <= radiusTiles) {
                    tiles.push({ x, y });
                }
            }
        }
        return dedupeTiles(tiles);
    }

    if (template === 'line') {
        return dedupeTiles(getLineTiles(grid, origin, sizeFeet, spec.facing));
    }

    if (template === 'cone') {
        return dedupeTiles(getConeTiles(grid, origin, sizeFeet, spec.facing));
    }

    if (template === 'cube') {
        return dedupeTiles(getCubeTiles(grid, origin, sizeFeet, spec.facing));
    }

    return [];
}

export function getTemplateTileKeys(grid, spec = {}) {
    return getTemplateTiles(grid, spec).map((tile) => getTileKey(tile.x, tile.y));
}

export function collectTemplateTargets(grid, spec = {}, options = {}) {
    const tiles = getTemplateTiles(grid, spec);
    const results = [];
    const seen = new Set();

    tiles.forEach((tile) => {
        Object.values(grid.occupied || {}).forEach((token) => {
            if (token.hp <= 0 || token.x !== tile.x || token.y !== tile.y) return;
            if (options.team && token.team !== options.team) return;
            if (options.excludeTeam && token.team === options.excludeTeam) return;
            if (options.filter && !options.filter(token, tile)) return;
            if (seen.has(token.id)) return;
            seen.add(token.id);
            results.push({
                id: token.id,
                token,
                tile,
                cover: spec.origin ? getCoverBetweenPoints(grid, spec.origin, tile) : 'none'
            });
        });
    });

    return results;
}
