'use strict';
SIAB.state = { tubes: [], activeId: null, nextId: 1, nextGroup: 1, view: 'focus', showPH: true, started: false };
SIAB.current = () => SIAB.state.tubes.find(t => t.id === SIAB.state.activeId);
SIAB.targets = tube => tube.group ? SIAB.state.tubes.filter(t => t.group === tube.group) : [tube];
SIAB.newTube = (options = {}) => {
  const id = SIAB.state.nextId++;
  const tube = { id, name: `Tubo ${id}`, solution: 'hcl', concentration: .01, initialVolume: 1,
    titrant: 'naoh', titrantConcentration: .01, dropVolume: .05, indicator: 'btb', additions: [], group: null, ...options };
  tube.additions = [...tube.additions];
  SIAB.state.tubes.push(tube);
  return tube;
};
SIAB.newTube({ indicator: 'btb' });
SIAB.newTube({ indicator: 'phenol' });
SIAB.newTube({ indicator: 'universal' });
SIAB.state.activeId = 1;
