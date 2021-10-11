window.onload = () => {
    getData({ source: 'trello' }, data => {        
        const config = { 
            showSubtitles: true, // enforces subtitles/descriptions of themes
            showVision: true,
            showPillars: true
        };
        window.roadmap = ThemeBasedRoadmap.of({ data, config });
        window.roadmap.render();        
    });
};
