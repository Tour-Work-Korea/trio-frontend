const TYPE_GROUPS = {
  feat: '기능 추가', fix: '오류 수정', hotfix: '긴급 오류 수정',
  perf: '성능 개선', refactor: '코드 개선', style: '화면 및 스타일 수정',
  test: '테스트', docs: '문서 수정', ci: '자동화 개선',
  build: '빌드 설정', chore: '기타 작업', revert: '변경 되돌리기',
};
const PLACEHOLDERS = new Set([
  '작업 내용 간단 작성', '큰 작업 단위 작성',
  '세부 작업 1', '세부 작업 2', '세부 작업 3',
]);
const MARKER = /<!-- branch-issue-sync:pr:\d+:[a-f0-9]+ -->/g;
const normalize = value => value.trim().replace(/\s+/g, ' ');
const issueFromBranch = branch => {
  const match = branch.match(/#(\d+)(?=$|[-_/])/)
    || branch.match(/(?:^|\/)(\d+)(?=$|[-_])/);
  return match ? Number(match[1]) : null;
};
const cleanTitle = title => title.trim()
  .replace(/^[a-z]+(?:\([^)]*\))?!?:\s*/i, '')
  .replace(/^\[.*?\]\s*/, '')
  .replace(/\s*\(#\d+\)$/, '');

function section(body, name) {
  const lines = body.split('\n');
  const start = lines.findIndex(line => /^##\s/.test(line) && line.includes(name));
  if (start < 0) return '';
  const offset = lines.slice(start + 1).findIndex(line => /^##\s/.test(line));
  const end = offset < 0 ? lines.length : start + 1 + offset;
  return lines.slice(start + 1, end).join('\n');
}

function parseGroups(text, fallback) {
  const groups = [];
  let current;
  for (const line of text.split('\n')) {
    const heading = line.match(/^\s*\d+[.)]\s+(.+?)\s*$/)
      || line.match(/^###\s+(.+?)\s*$/);
    if (heading) {
      if (PLACEHOLDERS.has(normalize(heading[1]))) {
        current = null;
        continue;
      }
      current = {title: heading[1].trim(), tasks: [], notes: []};
      groups.push(current);
      continue;
    }
    const task = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+?)\s*$/);
    if (task && !PLACEHOLDERS.has(normalize(task[2]))) {
      if (!current) {
        current = {title: fallback, tasks: [], notes: []};
        groups.push(current);
      }
      current.tasks.push({text: task[2].trim(), done: task[1].toLowerCase() === 'x'});
    } else if (line.trim() && !task) {
      if (!current) {
        current = {title: fallback, tasks: [], notes: []};
        groups.push(current);
      }
      current.notes.push(line);
    }
  }
  return groups;
}

function mergeGroups(existing, incoming) {
  for (const group of incoming) {
    let target = existing.find(item => normalize(item.title) === normalize(group.title));
    if (!target) {
      target = {title: group.title, tasks: [], notes: []};
      existing.push(target);
    }
    for (const task of group.tasks) {
      // Also match a manually grouped task: do not duplicate it in a new category.
      const previous = existing.flatMap(item => item.tasks)
        .find(item => normalize(item.text) === normalize(task.text));
      if (previous) previous.done ||= task.done;
      else target.tasks.push({...task});
    }
    for (const note of group.notes) {
      if (!target.notes.includes(note)) target.notes.push(note);
    }
  }
  return existing.filter(group => group.tasks.length || group.notes.length);
}

function replaceSection(body, name, heading, text) {
  const lines = body.split('\n');
  const start = lines.findIndex(line => /^##\s/.test(line) && line.includes(name));
  const replacement = `${heading}\n\n${text.trim()}\n`;
  if (start < 0) return `${body.trim()}\n\n${replacement}`.trim();
  const offset = lines.slice(start + 1).findIndex(line => /^##\s/.test(line));
  const end = offset < 0 ? lines.length : start + 1 + offset;
  lines.splice(start, end - start, replacement);
  return lines.join('\n').trim();
}

function commitGroups(commits, issueNumber) {
  const groups = [];
  for (const commit of commits) {
    const subject = commit.commit.message.split('\n')[0].trim();
    if (/^Merge\b/i.test(subject)) continue;
    const references = [...subject.matchAll(/#(\d+)/g)].map(match => Number(match[1]));
    // Ignore work imported from a different numbered feature branch.
    if (references.length && !references.includes(issueNumber)) continue;
    const type = subject.match(/^([a-z]+)(?:\([^)]*\))?!?:/i)?.[1]?.toLowerCase();
    const text = cleanTitle(subject);
    if (!text || /(?:브랜치\s*병합|변경\s*병합|merge\b)/i.test(text)) continue;
    mergeGroups(groups, [{title: TYPE_GROUPS[type] || '기타 작업', tasks: [{text, done: true}], notes: []}]);
  }
  return groups;
}

module.exports = async ({github, context, core}) => {
  const pr = context.payload.pull_request;
  if (!pr?.merged || pr.base.ref !== 'develop') return;
  const issueNumber = issueFromBranch(pr.head.ref);
  if (!issueNumber) {
    core.info(`이슈 번호가 없는 브랜치이므로 건너뜁니다: ${pr.head.ref}`);
    return;
  }
  const repo = context.repo;
  let issue;
  try {
    ({data: issue} = await github.rest.issues.get({...repo, issue_number: issueNumber}));
  } catch (error) {
    if (error.status !== 404) throw error;
    core.warning(`#${issueNumber} 이슈가 없어 갱신하지 않았습니다.`);
    return;
  }
  if (issue.pull_request) {
    core.warning(`#${issueNumber}는 이슈가 아니라 PR이므로 건너뜁니다.`);
    return;
  }

  // Fetch all merges of the same branch so subsequent merges accumulate work.
  // A queued run that was replaced by a later merge is recovered here as well.
  const previous = await github.paginate(github.rest.pulls.list, {
    ...repo, state: 'closed', base: 'develop',
    head: `${repo.owner}:${pr.head.ref}`, per_page: 100,
  });
  const pulls = [...new Map([...previous, pr]
    .filter(item => item.merged_at && item.head.ref === pr.head.ref
      && item.head.repo?.full_name === pr.head.repo.full_name)
    .map(item => [item.number, item])).values()]
    .sort((a, b) => a.merged_at.localeCompare(b.merged_at));
  const original = issue.body || '';
  const markers = new Set(original.match(MARKER) || []);
  let body = original.replace(MARKER, '').trim();
  let groups = parseGroups(section(body, '할 일'), '기존 작업');
  const summaryLines = section(body, '작업 내용').split('\n')
    .filter(line => line.trim() && !PLACEHOLDERS.has(normalize(line.replace(/^\s*[-*]\s+/, ''))));
  let changed = false;
  for (const merged of pulls) {
    const marker = `<!-- branch-issue-sync:pr:${merged.number}:${merged.merge_commit_sha} -->`;
    if (markers.has(marker)) continue;
    const {data: full} = await github.rest.pulls.get({...repo, pull_number: merged.number});
    const fallback = cleanTitle(full.title) || '작업 내용';
    let incoming = parseGroups(section(full.body || '', '할 일'), fallback);
    if (!incoming.some(group => group.tasks.length)) {
      const commits = await github.paginate(github.rest.pulls.listCommits, {
        ...repo, pull_number: full.number, per_page: 100,
      });
      incoming = commitGroups(commits, issueNumber);
      if (!incoming.length) {
        core.warning(`PR #${full.number}에 반영할 작업 목록이나 관련 커밋이 없습니다.`);
        continue;
      }
    }
    groups = mergeGroups(groups, incoming);
    for (const group of incoming) {
      const summary = `- ${group.title}`;
      if (!summaryLines.some(line => normalize(line.replace(/^\s*[-*]\s+/, '')) === normalize(group.title))) {
        summaryLines.push(summary);
      }
    }
    markers.add(marker);
    changed = true;
  }
  if (!changed) {
    core.info(`#${issueNumber}에 새로 반영할 병합이 없습니다.`);
    return;
  }
  body = replaceSection(body, '작업 내용', '## 📌 작업 내용', summaryLines.join('\n'));
  const tasks = groups.map((group, index) => [
    `${index + 1}. ${group.title}`,
    ...group.tasks.map(task => `- [${task.done ? 'x' : ' '}] ${task.text}`),
    ...group.notes,
  ].join('\n')).join('\n\n');
  body = replaceSection(body, '할 일', '## 🛠 할 일', tasks);
  body = `${body}\n\n${[...markers].join('\n')}\n`;
  if (body.length > 60000) throw new Error('이슈 본문이 너무 길어 자동 갱신을 중단합니다.');
  // Re-read before writing to avoid silently replacing an edit made during collection.
  const {data: latest} = await github.rest.issues.get({...repo, issue_number: issueNumber});
  if ((latest.body || '') !== original) {
    throw new Error('수집 중 이슈 본문이 변경되었습니다. 최신 실행을 다시 진행해 주세요.');
  }
  await github.rest.issues.update({...repo, issue_number: issueNumber, body});
  core.info(`#${issueNumber} 작업 목록을 갱신했습니다.`);
};
