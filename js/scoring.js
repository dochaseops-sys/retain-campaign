/**
 * Retain Social Growth Challenge - Scoring Engine & Rules
 * 
 * Rules:
 * - One verified new follower on any campaign platform: 1 point
 * - One person follows three platforms: 4 total points
 * - One person follows every participating platform (e.g. 6 platforms): 6 total points
 * - A referred follower meaningfully engages with a Retain post: 1 bonus point
 * - Existing followers, duplicate submissions, bots, purchased followers and fake accounts do not count.
 */

export function calculateReferralPoints(platforms = [], engaged = false, totalActivePlatformsCount = 6) {
  const count = Array.isArray(platforms) ? platforms.length : 0;
  if (count === 0) return 0;

  let basePoints = 0;

  if (count === 1) {
    basePoints = 1;
  } else if (count === 2) {
    basePoints = 2;
  } else if (count === 3) {
    basePoints = 4; // 3 platforms bonus
  } else if (count >= totalActivePlatformsCount && totalActivePlatformsCount > 0) {
    basePoints = 6; // All platforms bonus
  } else if (count >= 4) {
    // 4 or 5 platforms when total is 6
    basePoints = 4 + (count - 3); // 4->5 pts, 5->5 pts / scale up
  }

  const bonusPoints = engaged ? 1 : 0;
  return basePoints + bonusPoints;
}

export function getPointsBreakdown(platforms = [], engaged = false, totalActivePlatformsCount = 6) {
  const count = platforms.length;
  let baseText = '';
  let points = calculateReferralPoints(platforms, engaged, totalActivePlatformsCount);

  if (count === 0) {
    baseText = '0 platforms selected';
  } else if (count === 1) {
    baseText = '1 platform follow (1 pt)';
  } else if (count === 2) {
    baseText = '2 platforms follow (2 pts)';
  } else if (count === 3) {
    baseText = '3 platforms follow bonus! (4 pts)';
  } else if (count >= totalActivePlatformsCount) {
    baseText = `All ${totalActivePlatformsCount} platforms super-fan bonus! (6 pts)`;
  } else {
    baseText = `${count} platforms follow (${points - (engaged ? 1 : 0)} pts)`;
  }

  const engagementText = engaged ? ' + 1 bonus pt (Post Engagement)' : '';
  return {
    totalPoints: points,
    summary: `${baseText}${engagementText}`
  };
}

export function getEmployeeBadge(points, verifiedFollowers) {
  if (points >= 50 || verifiedFollowers >= 15) {
    return { name: 'Community Titan', color: 'bg-amber-500/20 text-amber-800 border-amber-500/40', icon: 'crown' };
  }
  if (points >= 30 || verifiedFollowers >= 10) {
    return { name: 'Gold Champion', color: 'bg-yellow-500/20 text-yellow-800 border-yellow-500/40', icon: 'award' };
  }
  if (points >= 15 || verifiedFollowers >= 5) {
    return { name: 'Silver Ambassador', color: 'bg-slate-400/20 text-slate-700 border-slate-400/40', icon: 'shield' };
  }
  if (points > 0 || verifiedFollowers > 0) {
    return { name: 'Rising Contender', color: 'bg-rose-500/20 text-rose-700 border-rose-500/40', icon: 'zap' };
  }
  return { name: 'New Participant', color: 'bg-slate-200 text-slate-600 border-slate-300', icon: 'user' };
}

export function getMilestoneProgress(points) {
  const milestones = [
    { target: 10, label: 'Bronze Milestone', reward: 'Official Retain Growth Badge & Swag Pack' },
    { target: 25, label: 'Silver Milestone', reward: '$100 Amazon Voucher & Founder Shoutout' },
    { target: 50, label: 'Gold Milestone', reward: 'VIP Team Lunch & $250 Wellness Grant' },
    { target: 100, label: 'Grand Champion', reward: 'MacBook Air / Tech Package + 1st Place Trophy' }
  ];

  for (let i = 0; i < milestones.length; i++) {
    if (points < milestones[i].target) {
      const prevTarget = i === 0 ? 0 : milestones[i - 1].target;
      const progress = Math.min(100, Math.round(((points - prevTarget) / (milestones[i].target - prevTarget)) * 100));
      return {
        nextMilestone: milestones[i],
        currentProgress: Math.max(0, progress),
        remainingPoints: milestones[i].target - points
      };
    }
  }

  return {
    nextMilestone: milestones[milestones.length - 1],
    currentProgress: 100,
    remainingPoints: 0,
    isCompleted: true
  };
}
