export const FEAT_IDS = ['alert', 'mobile', 'resilient', 'tough'];
export const RESILIENT_ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export const featDefinitions = {
    alert: {
        id: 'alert',
        name: 'Alert',
        description: 'Gain a +5 bonus to initiative rolls.',
        modifiers: [
            { type: 'flat_bonus', target: 'initiative', value: 5 }
        ]
    },
    mobile: {
        id: 'mobile',
        name: 'Mobile',
        description: 'Your speed increases by 10 feet, and creatures you make a melee attack against cannot make opportunity attacks against you for the rest of the turn.',
        modifiers: [
            { type: 'flat_bonus', target: 'speed', value: 10 }
        ]
    },
    resilient: {
        id: 'resilient',
        name: 'Resilient',
        description: 'Increase one chosen ability score by 1 and gain proficiency in saving throws using that ability.'
    },
    tough: {
        id: 'tough',
        name: 'Tough',
        description: 'Your hit point maximum increases by 2 per level.',
    }
};

export function normalizeFeatSelection(featEntry) {
    if (typeof featEntry !== 'string') return null;
    const trimmed = featEntry.trim().toLowerCase();
    if (!trimmed) return null;
    if (trimmed.startsWith('resilient:')) {
        const [, abilityRaw = ''] = trimmed.split(':');
        const ability = abilityRaw.toUpperCase();
        if (!RESILIENT_ABILITIES.includes(ability)) return null;
        return `resilient:${ability}`;
    }
    return FEAT_IDS.includes(trimmed) ? trimmed : null;
}

export function normalizeFeatSelections(feats = []) {
    return [...new Set((Array.isArray(feats) ? feats : []).map(normalizeFeatSelection).filter(Boolean))];
}

export function getFeatId(featEntry) {
    const normalized = normalizeFeatSelection(featEntry);
    if (!normalized) return null;
    return normalized.split(':')[0];
}

export function getFeatDefinition(featEntry) {
    const featId = getFeatId(featEntry);
    return featId ? featDefinitions[featId] || null : null;
}

export function getResilientAbility(featEntry) {
    const normalized = normalizeFeatSelection(featEntry);
    if (!normalized || !normalized.startsWith('resilient:')) return null;
    return normalized.split(':')[1] || null;
}

export function buildResilientFeatSelection(ability) {
    const upper = String(ability || '').toUpperCase();
    return RESILIENT_ABILITIES.includes(upper) ? `resilient:${upper}` : null;
}

export function getFeatAbilityBonuses(feats = []) {
    return normalizeFeatSelections(feats).reduce((bonuses, featEntry) => {
        const ability = getResilientAbility(featEntry);
        if (ability) {
            bonuses[ability] = (bonuses[ability] || 0) + 1;
        }
        return bonuses;
    }, { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 });
}

export function getFeatSaveProficiencies(feats = []) {
    return normalizeFeatSelections(feats)
        .map(getResilientAbility)
        .filter(Boolean);
}

export function getToughHitPointBonus(level = 1, feats = []) {
    return normalizeFeatSelections(feats).some((featEntry) => getFeatId(featEntry) === 'tough')
        ? Math.max(1, Number(level) || 1) * 2
        : 0;
}

export function actorHasFeat(actor, featId) {
    return normalizeFeatSelections(actor?.feats || []).some((featEntry) => getFeatId(featEntry) === featId);
}
