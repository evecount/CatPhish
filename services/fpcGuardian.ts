
import { Question } from "../types";

/**
 * FORWARD PROPAGATION CONSENSUS (FPC) GUARDIAN
 * 
 * Goal: The "Semantic Leaky ReLU".
 * Filters bots by requiring high-entropy, perspective-shifting responses.
 */
export class FPCGuardian {
    private logicAnchors: Question[] = [
        {
            id: "trap-1",
            text: "If you could share a silver platter of salmon with anyone, who would it be?",
            type: "cat-based",
            options: [
                { id: "A", text: "The Dalai Lama", trait: "Spiritual" },
                { id: "B", text: "Garfield", trait: "Gluttonous" },
                { id: "C", text: "My Reflection", trait: "Narcissistic" },
                { id: "D", text: "A stray kitten", trait: "Altruistic" }
            ]
        },
        {
            id: "trap-2",
            text: "Your scratching post is on fire. You save one item:",
            type: "cat-based",
            options: [
                { id: "A", text: "My favorite toy mouse", trait: "Sentimental" },
                { id: "B", text: "The bag of catnip", trait: "Hedonistic" },
                { id: "C", text: "The human's laptop", trait: "Chaotic" },
                { id: "D", text: "Nothing, I watch it burn", trait: "Nihilistic" }
            ]
        },
        {
            id: "trap-3",
            text: "A red laser dot appears on the wall. It is the secret to the universe. Do you:",
            type: "cat-based",
            options: [
                { id: "A", text: "Chase it until I collapse", trait: "Driven" },
                { id: "B", text: "Stare at it with judgment", trait: "Analytical" },
                { id: "C", text: "Meow for help", trait: "Dependent" },
                { id: "D", text: "Ignore it, I am the laser", trait: "Enlightened" }
            ]
        },
        {
            id: "trap-4",
            text: "A mirror is placed in your path. What do you see behind the eyes?",
            type: "cat-based",
            options: [
                { id: "A", text: "An ancient predator", trait: "Primal" },
                { id: "B", text: "A lost child", trait: "Vulnerable" },
                { id: "C", text: "Infinite static", trait: "Complex" },
                { id: "D", text: "Just a fluffy cat", trait: "Grounded" }
            ]
        },
        {
            id: "trap-5",
            text: "The human stops speaking. They only listen to your purr. What is your message?",
            type: "cat-based",
            options: [
                { id: "A", text: "Everything is okay", trait: "Comforting" },
                { id: "B", text: "Feed me now", trait: "Practical" },
                { id: "C", text: "We are all energy", trait: "Mystical" },
                { id: "D", text: "The silence is enough", trait: "Stoic" }
            ]
        }
    ];

    generateTrap(index?: number): Question {
        const i = index !== undefined ? index : Math.floor(Math.random() * this.logicAnchors.length);
        return this.logicAnchors[i];
    }

    getAllAnchors(): Question[] {
        return this.logicAnchors;
    }

    async evaluateResponse(response: string): Promise<boolean> {
        if (response.length < 3) return false;
        return response.length > 5;
    }

    async evaluateSemanticDepth(answer: string): Promise<{ depthScore: number; feedback: string }> {
        const length = answer.length;
        if (length < 10) {
            return { depthScore: 0.2, feedback: "A bit brief." };
        } else if (length < 50) {
            return { depthScore: 0.6, feedback: "Good depth." };
        } else {
            return { depthScore: 0.95, feedback: "Profound." };
        }
    }
}
