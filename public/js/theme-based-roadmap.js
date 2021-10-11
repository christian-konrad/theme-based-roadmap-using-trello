class ThemeBasedRoadmap {
    constructor({target="#roadmap-wrapper", data={}, config={
        showSubtitles: false,
        showVision: false,
        showPillars: false
    }} = {}) {
        this.target = target;
        this.data = data;

        this.style = data.style;
        
        this._sanitizeData();
        
        this.state = { 
            ...config,
            themes: []
        };
    }
    
    static of(...args) {
        return new this(...args);
    }

    _renderVision() {
        return `
            <div class="vision-header">
                <div class="vision-header-center">
                    <div class="vision-header-center-content">
                        <div class="vision-header-center-label">Vision/Mission/Nordstern</div>
                        <div class="vision-header-center-value">${this.data.vision}</div>
                    </div>
                </div>
            </div>
        `;
    }

    _renderStrategicPillars() {
        const _renderStrategicPillar = (pillar) => `
            <div class="strategic-pillar">${pillar}</div>
        `;

        return `
            <div class="strategic-pillars">
                <div class="strategic-pillars-title">Strategische Säulen/Werte</div>
                <div class="strategic-pillars-content">${this.data.pillars.map(pillar => _renderStrategicPillar(pillar)).join('')}</div>
            </div>
        `; 
    }

    _renderStrategicPlan = () => {        
        // a theme item here represents a project phase for a given theme project and release date
        const _renderTheme = (theme, lane) => {
            if (!this.state.themes[theme.id]) {
                this.state.themes[theme.id] = {
                    arefeaturesExpanded: false
                };
            }
            
            return `
                <div class="theme-wrapper">
                    <div class="theme" title="${theme.subtitle}" data-theme-id="${theme.id}" data-lane-color="${lane.color}" data-features-expanded="${this.state.themes[theme.id].arefeaturesExpanded}" data-expandable="${theme.features && theme.features.length ? true : false}">
                        <div class="theme-lane-indicator" style="border-left-color: ${lane.color}"></div>
                        <div class="theme-content-wrapper">
                            <div class="theme-title-row">
                                <div class="theme-title">${theme.title}</div>                                
                            </div>
                            <div class="theme-subtitle">${theme.subtitle}</div>
                        </div>
                        ${theme.features && theme.features.length ?
                        `<div class="theme-features-toggle-wrapper">
                            <div class="theme-features-toggle"></div>
                        </div>`
                        : ''}
                    </div>
                    <div class="theme-features">
                        ${this._renderThemeFeatures(theme.features, lane.color)}
                    </div>
                </div>
            `;
        };
        
        const _renderLaneEmptyState = () => `
            <div class="release-empty-state">Bisher keine Themen geplant</div>
        `;
        
        const _renderLane = (lane) => `
            <div class="lane" title="${lane.id}" style="border-color: ${lane.color}">
                <div class="lane-indicator">${lane.title}</div>
                <div class="lane-themes">
                    ${lane.themes.length ? lane.themes.map(theme => _renderTheme(theme, lane)).join('') : _renderLaneEmptyState()}
                </div>
            </div>
        `;

        const _renderReleaseEmptyState = () => `
            <div class="release-empty-state">Bisher keine Lanes und Themen für dieses Release geplant</div>
        `;

        const _getReleaseDescription = (releaseTitle) => {
            return {
                NOW: "Our top priority. We're probably working on it right now or starting pretty soon.",
                NEXT: "Our next priority. We'll work on this soon if everything goes as planned.",
                LATER: "Not a priority. We're considering working on this but it's too early to know when."
            }[releaseTitle.toUpperCase()] || '';
        };

        const _renderStrategicPlanRelease = (release) => `
            <div class="strategic-plan-release" data-release-id="${release.id}">
                <div class="strategic-plan-release-title">
                    <div class="strategic-plan-release-title-text">${release.title}</div>
                </div>
                <div class="strategic-plan-release-description">${_getReleaseDescription(release.title)}</div>
                <div class="strategic-plan-release-lanes">${release.lanes.length ? release.lanes.map(lane => _renderLane({ ...lane, ...this.data.lanes.find(laneMetadata => laneMetadata.id === lane.id) })).join('') : _renderReleaseEmptyState()}</div>
            </div>
        `;
        
        return `
            <div class="strategic-plan" data-force-subtitles="${this.state.showSubtitles}">
                <div class="strategic-plan-content">
                    <div class="strategic-plan-releases">${this.data.releases.map(release => _renderStrategicPlanRelease(release)).join('')}</div>
                </div>
            </div>
        `; 
    }

    _sanitizeData() {
        const _sanitizeRecursive = data => {
            if (data === null) return;
            if (typeof data === 'string') {
                return filterXSS(data);
            }
            if (typeof data === 'object') {
                Object.keys(data).forEach(key => data[key] = _sanitizeRecursive(data[key]));
            }
            if (Array.isArray(data)) {
                data = data.map(entry => _sanitizeRecursive(entry));
            }
            return data;
        };
        
        this.data = _sanitizeRecursive(this.data);
    }
    
    _renderThemeFeatures(features, laneColor) {
        if (!features) return '';
        return features.map(feature => `
            <div class="theme-feature" data-id="${feature.id}">
                <div class="theme-feature-lane-indicator" style="border-left-color: ${laneColor}"></div>
                <div class="theme-feature-title-row">
                    <div class="theme-feature-title">${feature.title}</div>
                    ${feature.state === 'complete' ? `<div class="theme-feature-complete-tag">DONE</div>` : ''}             
                </div>
                <div class="theme-feature-subtitle">${feature.subtitle || ''}</div>
            </div>
        `).join('');
    }
    
    _initListeners() {
        $(this.target).find('.theme').each((index, element) => {
            const $element = $(element);
            const id = $element.attr('data-theme-id');

            // TODO on click, open github issue
            if ($element.attr('data-expandable') === 'true') {
                $element.off('click').click((e) => {
                // $element.find('.theme-features-toggle').off('click').click((e) => {
                    e.stopPropagation();
                    this.state.themes[id].areFeaturesExpanded = !this.state.themes[id].areFeaturesExpanded;
                    $element.attr('data-features-expanded', this.state.themes[id].areFeaturesExpanded);
                });
            }
        });
    }

    render(config) {
        $(this.target).attr('data-style-theme', this.style).html([
            this.state.showVision && this._renderVision(),
            this.state.showPillars && this._renderStrategicPillars(),
            this._renderStrategicPlan()
        ]);
        
        this._initListeners();
    }
}
