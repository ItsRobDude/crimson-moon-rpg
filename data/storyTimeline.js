export const CANONICAL_START_SCENE = 'SCENE_BRIEFING';

export const STORY_EVENT_STATUS = {
    LOCKED: 'locked',
    AVAILABLE: 'available',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    MISSED: 'missed'
};

export const storyActs = [
    {
        id: 'act_1_briefing_and_departure',
        title: 'Act I - Briefing and Departure',
        summary: 'Character creation ends in Silverthorn, where Alderic sends the party toward Whisperwood.'
    },
    {
        id: 'act_2_sporefall_revelations',
        title: 'Act II - Sporefall Revelations',
        summary: 'Whisperwood falls into Sporefall, Eoin reveals the cost of the disaster, and the party traces Aodhan.'
    },
    {
        id: 'act_3_shattered_routes',
        title: 'Act III - Shattered Routes',
        summary: 'After the confrontation with Aodhan, the party follows the Durnhelm and Lament Hill leads.'
    },
    {
        id: 'act_4_lament_hill_truth',
        title: 'Act IV - Lament Hill Truth',
        summary: 'Aine and the Forbidden Archives reveal the truth about Alderic, Ciara, and the Stone of Oblivion.'
    },
    {
        id: 'act_5_hushbriar_endgame',
        title: 'Act V - Hushbriar Endgame',
        summary: 'The demigod hunt and Hushbriar faction struggle become the endgame sandbox for Part I.'
    }
];

export const storyEvents = {
    alderic_briefing: {
        id: 'alderic_briefing',
        actId: 'act_1_briefing_and_departure',
        title: 'Alderic Briefing',
        summary: 'The canonical opening: character creation ends in Alderic\'s chamber in Silverthorn.'
    },
    silverthorn_departure: {
        id: 'silverthorn_departure',
        actId: 'act_1_briefing_and_departure',
        title: 'Leave Silverthorn',
        summary: 'The party chooses to leave the city and begin the road into Shadowmire.'
    },
    sporefall_arrival: {
        id: 'sporefall_arrival',
        actId: 'act_2_sporefall_revelations',
        title: 'Arrival in Sporefall',
        summary: 'The Whisperwood mission turns into a survival scene when the party wakes beneath the crimson moon.'
    },
    eoin_thread: {
        id: 'eoin_thread',
        actId: 'act_2_sporefall_revelations',
        title: 'Find Eoin',
        summary: 'Eoin becomes the first strong witness to what happened in Whisperwood.'
    },
    aodhan_thread: {
        id: 'aodhan_thread',
        actId: 'act_2_sporefall_revelations',
        title: 'Trace Aodhan',
        summary: 'Cathedral and manor leads point the party toward Aodhan and the Stone of Oblivion.'
    },
    durnhelm_thread: {
        id: 'durnhelm_thread',
        actId: 'act_3_shattered_routes',
        title: 'Durnhelm Lead',
        summary: 'The dwarven route explains the relic, the city\'s fall, and where Aodhan went next.'
    },
    lament_hill_thread: {
        id: 'lament_hill_thread',
        actId: 'act_4_lament_hill_truth',
        title: 'Lament Hill Lead',
        summary: 'Aine and the hilltop cottage reveal the mark, the cost of the stone, and the next branching leads.'
    },
    archives_truth: {
        id: 'archives_truth',
        actId: 'act_4_lament_hill_truth',
        title: 'Forbidden Archives Truth',
        summary: 'The archives confirm how the Stone of Oblivion works and expose Alderic\'s alliance with Ciara.'
    },
    hushbriar_demigod_thread: {
        id: 'hushbriar_demigod_thread',
        actId: 'act_5_hushbriar_endgame',
        title: 'Hushbriar Demigod Hunt',
        summary: 'The sandbox endgame centers on Hushbriar, the guild, and the demigod needed to empower the stone.'
    }
};

export const locationStoryRequirements = {
    silverthorn: null,
    shadowmire: { id: 'silverthorn_departure', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    whisperwood: { id: 'sporefall_arrival', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    durnhelm: { id: 'durnhelm_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    lament_hill: { id: 'lament_hill_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    hushbriar: { id: 'hushbriar_demigod_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    thieves_hideout: { id: 'hushbriar_demigod_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] },
    soul_mill: { id: 'hushbriar_demigod_thread', oneOf: [STORY_EVENT_STATUS.AVAILABLE, STORY_EVENT_STATUS.ACTIVE, STORY_EVENT_STATUS.COMPLETED] }
};

export const locationUnlockHints = {
    shadowmire: 'Leave Silverthorn after Alderic briefs you.',
    whisperwood: 'Push the Whisperwood investigation past the road into Sporefall.',
    durnhelm: 'Reach the post-Aodhan branching point to follow the dwarven lead.',
    lament_hill: 'Reach the post-Aodhan branching point to follow the Lament Hill lead.',
    hushbriar: 'Advance the Lament Hill thread until the Hushbriar lead opens.',
    thieves_hideout: 'Open the Hushbriar demigod thread before searching the guild route.',
    soul_mill: 'Open the Hushbriar endgame thread before heading toward the Soul Mill.'
};

export const storySceneTriggers = {
    SCENE_BRIEFING: {
        activate: ['alderic_briefing'],
        actId: 'act_1_briefing_and_departure'
    },
    SCENE_BRIEFING_2: {
        activate: ['alderic_briefing'],
        actId: 'act_1_briefing_and_departure'
    },
    SCENE_BRIEFING_INFO: {
        activate: ['alderic_briefing'],
        actId: 'act_1_briefing_and_departure'
    },
    SCENE_HUB_SILVERTHORN: {
        complete: ['alderic_briefing'],
        unlock: ['silverthorn_departure'],
        actId: 'act_1_briefing_and_departure'
    },
    SCENE_SILVERTHORN_MARKET: {
        complete: ['alderic_briefing'],
        unlock: ['silverthorn_departure'],
        actId: 'act_1_briefing_and_departure'
    },
    SCENE_SHADOWMIRE_ROAD: {
        activate: ['silverthorn_departure'],
        complete: ['silverthorn_departure'],
        unlock: ['sporefall_arrival'],
        advance: { travel: 1 },
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_TRAVEL_SHADOWMIRE: {
        activate: ['silverthorn_departure'],
        complete: ['silverthorn_departure'],
        unlock: ['sporefall_arrival'],
        advance: { travel: 1 },
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_SPOREFALL_WAKE: {
        activate: ['sporefall_arrival'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_ARRIVAL_WHISPERWOOD: {
        complete: ['sporefall_arrival'],
        unlock: ['eoin_thread'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_MEET_EOIN: {
        activate: ['eoin_thread'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_EOIN_TALK: {
        complete: ['eoin_thread'],
        unlock: ['aodhan_thread'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_ALONE_AGAIN: {
        complete: ['eoin_thread'],
        unlock: ['aodhan_thread'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_MOONWELL: {
        activate: ['aodhan_thread'],
        actId: 'act_2_sporefall_revelations'
    },
    SCENE_AODHAN_TALK: {
        complete: ['aodhan_thread'],
        unlock: ['durnhelm_thread', 'lament_hill_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_AODHAN_DEFEAT: {
        complete: ['aodhan_thread'],
        unlock: ['durnhelm_thread', 'lament_hill_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_AFTERMATH: {
        complete: ['aodhan_thread'],
        unlock: ['durnhelm_thread', 'lament_hill_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_DURNHELM_GATES: {
        activate: ['durnhelm_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_DURNHELM_ENTRY: {
        complete: ['durnhelm_thread'],
        unlock: ['lament_hill_thread'],
        actId: 'act_3_shattered_routes'
    },
    SCENE_LAMENT_HILL_APPROACH: {
        activate: ['lament_hill_thread'],
        actId: 'act_4_lament_hill_truth'
    },
    SCENE_LAMENT_COTTAGE: {
        complete: ['lament_hill_thread'],
        unlock: ['archives_truth', 'hushbriar_demigod_thread'],
        actId: 'act_4_lament_hill_truth'
    },
    SCENE_LAMENT_GRAVES: {
        activate: ['lament_hill_thread'],
        actId: 'act_4_lament_hill_truth'
    },
    SCENE_SOUL_MILL_APPROACH: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_THIEVES_HIDEOUT: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_ARRIVAL_HUSHBRIAR: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    },
    SCENE_HUSHBRIAR_TOWN: {
        activate: ['hushbriar_demigod_thread'],
        actId: 'act_5_hushbriar_endgame'
    }
};

const STORY_EVENT_IDS = Object.keys(storyEvents);

function createDefaultEventStatus() {
    const eventStatus = {};

    STORY_EVENT_IDS.forEach((eventId) => {
        eventStatus[eventId] = {
            status: STORY_EVENT_STATUS.LOCKED,
            firstSeenSceneId: null,
            completedSceneId: null
        };
    });

    eventStatus.alderic_briefing.status = STORY_EVENT_STATUS.AVAILABLE;

    return eventStatus;
}

export function createDefaultStoryState() {
    return {
        canonicalStartScene: CANONICAL_START_SCENE,
        currentActId: storyActs[0].id,
        currentEventId: 'alderic_briefing',
        eventStatus: createDefaultEventStatus(),
        travelCount: 0,
        restCount: 0,
        dayCount: 0,
        lastSceneId: null,
        sceneVisitCounts: {}
    };
}

export function ensureStoryState(rawState) {
    const base = createDefaultStoryState();
    if (!rawState || typeof rawState !== 'object') {
        return base;
    }

    const normalized = {
        ...base,
        ...rawState,
        eventStatus: createDefaultEventStatus(),
        sceneVisitCounts: { ...base.sceneVisitCounts, ...(rawState.sceneVisitCounts || {}) }
    };

    STORY_EVENT_IDS.forEach((eventId) => {
        const existing = rawState.eventStatus && rawState.eventStatus[eventId]
            ? rawState.eventStatus[eventId]
            : {};

        normalized.eventStatus[eventId] = {
            ...base.eventStatus[eventId],
            ...existing
        };

        if (!Object.values(STORY_EVENT_STATUS).includes(normalized.eventStatus[eventId].status)) {
            normalized.eventStatus[eventId].status = base.eventStatus[eventId].status;
        }
    });

    if (!storyActs.some((act) => act.id === normalized.currentActId)) {
        normalized.currentActId = base.currentActId;
    }

    if (!storyEvents[normalized.currentEventId]) {
        normalized.currentEventId = base.currentEventId;
    }

    return normalized;
}

export function getStoryEventStatus(storyState, eventId) {
    return storyState?.eventStatus?.[eventId]?.status || STORY_EVENT_STATUS.LOCKED;
}

export function isStoryEventCompleted(storyState, eventId) {
    return getStoryEventStatus(storyState, eventId) === STORY_EVENT_STATUS.COMPLETED;
}

export function unlockStoryEvent(storyState, eventId) {
    if (!storyEvents[eventId] || !storyState?.eventStatus?.[eventId]) {
        return false;
    }

    const current = storyState.eventStatus[eventId];
    if (current.status !== STORY_EVENT_STATUS.LOCKED && current.status !== STORY_EVENT_STATUS.MISSED) {
        return false;
    }

    current.status = STORY_EVENT_STATUS.AVAILABLE;
    return true;
}

export function activateStoryEvent(storyState, eventId, sceneId = null) {
    if (!storyEvents[eventId] || !storyState?.eventStatus?.[eventId]) {
        return false;
    }

    const current = storyState.eventStatus[eventId];
    if (current.status === STORY_EVENT_STATUS.COMPLETED) {
        return false;
    }

    if (current.status === STORY_EVENT_STATUS.LOCKED || current.status === STORY_EVENT_STATUS.MISSED) {
        current.status = STORY_EVENT_STATUS.AVAILABLE;
    }

    current.status = STORY_EVENT_STATUS.ACTIVE;
    if (!current.firstSeenSceneId) {
        current.firstSeenSceneId = sceneId;
    }

    return true;
}

export function completeStoryEvent(storyState, eventId, sceneId = null) {
    if (!storyEvents[eventId] || !storyState?.eventStatus?.[eventId]) {
        return false;
    }

    const current = storyState.eventStatus[eventId];
    if (current.status === STORY_EVENT_STATUS.COMPLETED) {
        return false;
    }

    if (!current.firstSeenSceneId) {
        current.firstSeenSceneId = sceneId;
    }

    current.status = STORY_EVENT_STATUS.COMPLETED;
    current.completedSceneId = sceneId;
    return true;
}

export function advanceStoryClock(storyState, delta = {}) {
    if (!storyState) return;

    storyState.travelCount += delta.travel || 0;
    storyState.restCount += delta.rest || 0;
    storyState.dayCount += delta.days || 0;
}

function updateCurrentEvent(storyState) {
    const activeEventId = STORY_EVENT_IDS.find((eventId) => getStoryEventStatus(storyState, eventId) === STORY_EVENT_STATUS.ACTIVE);
    if (activeEventId) {
        storyState.currentEventId = activeEventId;
        return;
    }

    const availableEventId = STORY_EVENT_IDS.find((eventId) => getStoryEventStatus(storyState, eventId) === STORY_EVENT_STATUS.AVAILABLE);
    if (availableEventId) {
        storyState.currentEventId = availableEventId;
    }
}

export function syncStoryStateForScene(storyState, sceneId) {
    if (!storyState) {
        return { activated: [], completed: [], unlocked: [], actChanged: false };
    }

    storyState.sceneVisitCounts[sceneId] = (storyState.sceneVisitCounts[sceneId] || 0) + 1;
    storyState.lastSceneId = sceneId;

    const trigger = storySceneTriggers[sceneId];
    if (!trigger) {
        updateCurrentEvent(storyState);
        return { activated: [], completed: [], unlocked: [], actChanged: false };
    }

    const changes = {
        activated: [],
        completed: [],
        unlocked: [],
        actChanged: false
    };

    (trigger.unlock || []).forEach((eventId) => {
        if (unlockStoryEvent(storyState, eventId)) {
            changes.unlocked.push(eventId);
        }
    });

    (trigger.activate || []).forEach((eventId) => {
        if (activateStoryEvent(storyState, eventId, sceneId)) {
            changes.activated.push(eventId);
        }
    });

    (trigger.complete || []).forEach((eventId) => {
        if (completeStoryEvent(storyState, eventId, sceneId)) {
            changes.completed.push(eventId);
        }
    });

    if (trigger.advance) {
        advanceStoryClock(storyState, trigger.advance);
    }

    if (trigger.actId && storyState.currentActId !== trigger.actId) {
        storyState.currentActId = trigger.actId;
        changes.actChanged = true;
    }

    updateCurrentEvent(storyState);

    return changes;
}

export function meetsStoryRequirement(storyState, requirement) {
    if (!requirement) return true;

    if (typeof requirement === 'string') {
        return isStoryEventCompleted(storyState, requirement);
    }

    if (requirement.id) {
        const status = getStoryEventStatus(storyState, requirement.id);
        if (requirement.status) {
            return status === requirement.status;
        }
        if (requirement.oneOf) {
            return requirement.oneOf.includes(status);
        }
        return status === STORY_EVENT_STATUS.COMPLETED;
    }

    if (requirement.actId) {
        return storyState?.currentActId === requirement.actId;
    }

    return true;
}

export function getLocationStoryRequirement(locationId) {
    return locationStoryRequirements[locationId] || null;
}

export function getLocationUnlockHint(locationId) {
    return locationUnlockHints[locationId] || null;
}
