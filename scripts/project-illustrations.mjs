// Precise documentation diagrams. No generated artwork or application assets.
const xml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const frame = (height, name, description, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${height}" viewBox="0 0 600 ${height}" role="img" aria-labelledby="title description"><title id="title">${xml(name)}</title><desc id="description">${xml(description)}</desc><rect width="600" height="${height}" rx="20" fill="#FBF8F2"/><g font-family="Arial, sans-serif" fill="#202A36">${body}</g></svg>\n`;

export function progressIllustration(project) {
  const done = project.tasks.filter(t => t.status === 'verified').length;
  const review = project.tasks.filter(t => t.status === 'ready_for_review').length;
  const blocked = project.tasks.filter(t => t.status === 'blocked').length;
  const height = 246 + project.milestones.length * 60;
  const rows = project.milestones.map((m, index) => {
    const tasks = project.tasks.filter(t => t.milestone === m.id);
    const complete = tasks.filter(t => t.status === 'verified').length;
    const y = 206 + index * 60;
    const fill = tasks.length ? 536 * complete / tasks.length : 0;
    return `<text x="32" y="${y}" font-size="22">${xml(m.name)}</text><text x="568" y="${y}" text-anchor="end" font-size="22" font-weight="700">${complete}/${tasks.length}</text><rect x="32" y="${y + 13}" width="536" height="8" rx="4" fill="#E5DFD6"/>${fill ? `<rect x="32" y="${y + 13}" width="${fill}" height="8" rx="4" fill="#20754D"/>` : ''}`;
  }).join('');
  return frame(height, 'Rogue+ milestone progress', `${done} of ${project.tasks.length} tracked tasks verified; ${review} ready for review; ${blocked} blocked. Each bar measures verified tasks in one milestone, not whole-product completion.`, `<rect x="32" y="30" width="40" height="5" rx="2" fill="#FF6A35"/><text x="32" y="79" font-size="32" font-weight="700">Project progress</text><text x="32" y="123" font-size="25" font-weight="700">${done}/${project.tasks.length} verified</text><text x="568" y="123" text-anchor="end" font-size="22">${review} in review · ${blocked} blocked</text><text x="32" y="158" font-size="21" fill="#52606B">Evidence-backed task counts · ${xml(project.reviewedOn)}</text>${rows}<text x="32" y="${height - 24}" font-size="20" fill="#52606B">Work-plan coverage, not overall product completion.</text>`);
}

export function localFlowIllustration() {
  const box = (x, y, width, heading, detail, planned = false) => `<rect x="${x}" y="${y}" width="${width}" height="104" rx="14" fill="${planned ? '#FFF0E9' : '#FFFFFF'}" stroke="${planned ? '#B63C17' : '#CFC7BC'}" ${planned ? 'stroke-dasharray="6 5"' : ''}/><text x="${x + 18}" y="${y + 37}" font-size="23" font-weight="700">${xml(heading)}</text><text x="${x + 18}" y="${y + 74}" font-size="20" fill="#52606B">${xml(detail)}</text>`;
  const arrow = (x1, y1, x2, y2) => `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="#52606B" stroke-width="2" marker-end="url(#arrow)"/>`;
  return frame(808, 'Rogue+ runs on your device', 'A local file is parsed and normalized in the browser and stored as account state. Pinned reference data and account state feed pure calculations and the companion screens. Independent user Builds and Run state are planned. No save upload or write-back.', `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="#52606B"/></marker></defs><rect x="32" y="30" width="40" height="5" rx="2" fill="#FF6A35"/><text x="32" y="80" font-size="30" font-weight="700">Your device runs Rogue+</text><text x="32" y="118" font-size="22" fill="#52606B">Local by default. Read-only game-save analysis.</text>${box(32, 152, 536, '01  Choose a local .prsv', 'Original game file stays untouched')}${arrow(300, 256, 300, 283)}${box(32, 290, 536, '02  Parse, validate, normalize', 'Browser processing → local account state')}${arrow(180, 394, 180, 428)}${box(32, 436, 254, 'Account facts', 'Stored on-device')}${box(314, 436, 254, 'Reference data', 'Bundled game data')}${arrow(159, 540, 240, 568)}${arrow(441, 540, 360, 568)}${box(32, 576, 536, '03  Calculate and display', 'Dex · Trainer · History · presets · priorities')}<text x="32" y="720" font-size="22" font-weight="700" fill="#B63C17">Planned: separate Builds + Run repositories</text><text x="32" y="758" font-size="21" fill="#52606B">No save-upload endpoint. No game-save write-back.</text>`);
}

export function verificationIllustration() {
  const step = (y, number, heading, detail, color) => `<circle cx="54" cy="${y + 32}" r="22" fill="${color}"/><text x="54" y="${y + 40}" text-anchor="middle" font-size="23" font-weight="700" fill="#FFFFFF">${number}</text><text x="94" y="${y + 25}" font-size="24" font-weight="700">${heading}</text><text x="94" y="${y + 58}" font-size="21" fill="#52606B">${detail}</text>`;
  return frame(450, 'Verification is separate from release', 'Implement and collect evidence, verify acceptance criteria, and record merge and deployment only when separately approved. Verified work can remain on an unreleased branch.', `<text x="32" y="66" font-size="30" font-weight="700">Done has evidence.</text><path d="M54 137 L54 322" stroke="#CFC7BC" stroke-width="3"/>${step(106, '1', 'Implement', 'One task, one reviewable change.', '#B63C17')}${step(205, '2', 'Verify', 'Criteria, checks and guidance reviewed.', '#20754D')}${step(304, '3', 'Release separately', 'Record approved merge and deployed SHA.', '#52606B')}<text x="32" y="420" font-size="21" fill="#52606B">Verified on a branch does not mean deployed.</text>`);
}
