
import { User, DailyDrop, Match } from "../types";
import { rankResonance } from "./geminiService";

export class SemanticMatcher {
    getDailyDrop(): DailyDrop {
        const rotating = [
            "What part of your reflection do you trust the most?",
            "If you were a color, which one would feel like silence?",
            "What is the most honest thing you've ever said to a stranger?",
            "If gravity stopped for 10 seconds, where would you want to be?"
        ];
        const day = new Date().getDate() % rotating.length;
        return {
            date: new Date().toISOString().split('T')[0],
            questionId: `anchor-today-${day}`,
            questionText: rotating[day]
        };
    }

    async findMatches(currentUser: User, currentAnswer: string, pool: { user: User, answer: string }[]): Promise<Match[]> {
        const candidateData = pool
            .filter(c => c.user.id !== currentUser.id)
            .map(c => ({ id: c.user.id, answer: c.answer }));
        
        // Use AI to rank the resonance
        const scores = await rankResonance(currentAnswer, candidateData);
        const scoreMap = new Map(scores.map(s => [s.id, s.score]));

        return pool
            .filter(c => c.user.id !== currentUser.id)
            .map(candidate => {
                const aiScore = scoreMap.get(candidate.user.id) || 0.5;
                
                // Add minor modifiers for core traits to "ground" the AI score
                // Fix: Replaced billPreference and dateBudget with coreTruth and location which exist on User type
                let traitBonus = 0;
                if (candidate.user.coreTruth && currentUser.coreTruth && candidate.user.coreTruth === currentUser.coreTruth) {
                    traitBonus += 0.05;
                }
                if (candidate.user.location === currentUser.location) {
                    traitBonus += 0.05;
                }

                const finalScore = Math.min(0.99, aiScore + traitBonus);

                return {
                    id: `match-${currentUser.id}-${candidate.user.id}`,
                    users: [currentUser.id, candidate.user.id] as [string, string],
                    compatibilityScore: finalScore,
                    sharedTraits: Array.from(new Set([...(currentUser.interests || []), ...(candidate.user.interests || [])])).slice(0, 3),
                    status: 'pending' as const,
                    createdAt: new Date().toISOString(),
                    targetUser: candidate.user
                };
            })
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    }
}
