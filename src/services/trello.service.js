const config = require('../config/config');

// eslint-disable-next-line import/order
const trelloNode = require('trello-node-api')(config.trello.apiKey, config.trello.oAuthToken);

const colorMap = {
  green: '#61bd4f',
  yellow: 'Integrate',
  orange: '#ff9f1a',
  red: '#eb5a46',
  purple: '#c377e0',
  blue: '#0079bf',
  sky: '#00c2e0',
  lime: 'lime',
  pink: 'pink',
  black: 'black'
};

const parseTrelloData = (data) => {
  const themes = data.cards.map(card => ({
    release: (cardList => ({
      title: cardList.name,
      id: cardList.id,
    }))(data.lists[card.idList]), // id and title
    id: card.id,
    title: card.name,
    subtitle: card.desc,
    externalLink: card.shortUrl,
    features: (() => {
      const checklist = card.checklists.find(checklist => checklist.name === 'Features');
      return checklist && checklist.checkItems ? checklist.checkItems.map(checkItem => ({
        title: checkItem.name,
        state: checkItem.state
      })) : [];
    })(),
    laneId: card.labels.length ? card.labels[0].color : null,
  }));

  const lanes = Object.keys(data.board.labelNames).map(color => ({
    id: color,
    title: data.board.labelNames[color],
    color: colorMap[color],
  }));

  let releases = [];
  themes.forEach(theme => {
    if (!releases.some(release => release.id === theme.release.id)) {
      releases.push({
        ...theme.release,
        lanes: [],
      });
    }
    const release = releases.find(release => release.id === theme.release.id);
    
    if (!release.lanes.some(lane => lane.id === theme.laneId)) {
      release.lanes.push({
        ...lanes.find(lane => lane.id === theme.laneId) || { id: null, title: 'Basis', color: 'gray' },
        themes: [],
      });
    }

    const lane = release.lanes.find(lane => lane.id === theme.laneId);

    lane && lane.themes && lane.themes.push(theme);
  });

  
  // TODO have vision and pillars in custom trello lanes

  let pillars;
  const pillarsCondition = release => release.title.toLowerCase() === 'pillars';
  try {
    const pillarsPseudoRelease = releases.find(release => release.title.toLowerCase() === 'pillars');
    if (pillarsPseudoRelease) {
      pillars = pillarsPseudoRelease.lanes[0].themes.map(theme => theme.title);
      releases = releases.filter(release => !pillarsCondition(release));
    }
  } catch (e) {}

  let vision;
  const visionCondition = release => release.title.toLowerCase().replace(" ", "_") === 'vision_statement';
  try {
    const visionPseudoRelease = releases.find(visionCondition);
    if (visionPseudoRelease) {
      vision = visionPseudoRelease.lanes[0].themes[0].title;
      releases = releases.filter(release => !visionCondition(release));
    }
  } catch (e) {}

  return {
    lanes,
    releases,
    vision: vision || config.roadmap.vision,
    pillars: pillars || config.roadmap.pillars.split(";").map(pillar => pillar.trim()),
  }
};

const getRoadmapBoard = async () => {
  const boardId = config.trello.roadmapBoardId;

  let cards = await trelloNode.board.searchCards(boardId);
  cards = await Promise.all(
    cards.map(async (card) => {
      const checklists = await Promise.all(card.idChecklists.map((checklistId) => trelloNode.checklist.search(checklistId)));
      return {
        ...card,
        checklists,
      };
    })
  );

  const lists = {};

  await Promise.all(
    cards.map(async (card) => {
      const list = await trelloNode.list.search(card.idList);
      lists[card.idList] = list;
    })
  );

  // return {
  //   board: await trelloNode.board.search(boardId),
  //   cards,
  //   lists,
  // };

  return {
    ...parseTrelloData({
      board: await trelloNode.board.search(boardId),
      cards,
      lists,
    }),
    style: config.roadmap.style,
  };
};

module.exports = {
  getRoadmapBoard,
};
