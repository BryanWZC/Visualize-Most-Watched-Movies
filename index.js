// constants
const WIDTH = 1000;
const HEIGHT = 600;
const PADDING = 80;

const SVGHEIGHT = HEIGHT - PADDING * 2;
const SVGWIDTH = WIDTH - PADDING * 2;

const URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

//svg
const svg = d3.select('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT);

//colors
const category = ['Action', 'Drama', 'Adventure', 'Family', 'Animation', 'Comedy', 'Biography'];
const colors = ['#8D3B72', '#8A7090', '#89A7A7', '#E4CC37', '#72E1D1', '#FFA686', '#005377'];
const colorScale = d3.scaleOrdinal()
    .domain(category)
    .range(colors);

// tiles
async function tiles(){
    const treemap = d3.treemap()
        .size([SVGWIDTH, SVGHEIGHT]);

    const data = await fetch(URL).then(res => res.json());
    const sortedData = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);

    const root = treemap(sortedData);

    const leaf = svg.selectAll('g')
        .data(root.leaves()).join('g')
        .attr('transform', d => `translate(${d.x0 + PADDING}, ${d.y0 + PADDING})`);

    const clipPath = leaf.append('clipPath')
        .attr('id', d => `${d.data.name.replace(/[ \']/g, '') + '-clip'}`)

    const rectClipped = clipPath.append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0);
    
    const rectShown = leaf.append('rect')
        .attr('class', 'tile')
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('fill', d => colorScale(d.data.category))
        .attr('fill-opacity', 0.6)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0);

    leaf.on('mouseover', (e, d) => {     
            const nameText = `Name: ${d.data.name}`;
            const categoryText =`Category: ${d.data.category}`;
            const valueText = `Value: ${d.data.value}`;

            const maxTextLength = Math.max(nameText.length, categoryText.length, valueText.length);
            const width = maxTextLength / 14 * 90;
            const height = 65;

            const tooltip = svg.append('g')
                .attr('id', 'tooltip')
                .attr('data-value', d.data.value)
                .attr('width', width)
                .attr('height', height)
                .attr('transform', `translate(${e.offsetX + 30}, ${e.offsetY})`);
            
            const rect = tooltip.append('rect')
                .attr('width', width)
                .attr('height', height)
                .attr('rx', 8)
                .attr('fill-opacity', 0.6)
                .attr('fill', '#040926');
            
            const text = tooltip.append('text')
                .selectAll('tspan')
                .data([nameText, categoryText, valueText])
                .join('tspan')
                .attr('fill', 'white')
                .attr('font-size', 10)
                .attr('y', (d, i) => i * 15 + 20)
                .attr('x', 10)
                .text(d => d);
        })
        .on('mouseout', (e, d) => {
            d3.selectAll('#tooltip').remove();
        })
    
    const title = leaf.append('text')
        .attr('clip-path', d => `url(#${d.data.name.replace(/[ \']/g, '') + '-clip'})`)
        .attr('text-anchor', 'start')
        .selectAll('tspan')
        .data(d => getWordsArray(d)).join('tspan')
        .attr('font-size', 10)
        .attr('y', (d,i) => i * 12 + 15)
        .attr('x', 5)
        .text(d => d);

    //utility function
    /**
     * Get an array of words for tspans that can fit within a given width
     * @param  {Object} d - data Object that contains movie data values
     * @return {Array}    - an array of words broken down from each name that will fit within a particular width
     */
    function getWordsArray(d){
        const width = d.x1 - d.x0;
        const name = d.data.name.trim().split(' ');
        const wordsPerWidth = Math.floor(14 / 80 * width);
        const arr = [];
        let nameCombined = '';
        for(let i = 0; i < name.length; i++){
            if(nameCombined.length == 0 && i < name.length - 1){
                nameCombined = name[i];
            }
            else{
                nameCombined = nameCombined.length > 0 ? nameCombined + ` ${name[i]}` : name[i];
                if(nameCombined.length <= wordsPerWidth) arr.push(nameCombined);
                else arr.push(nameCombined.split(' ')[0], nameCombined.split(' ')[1]);
                nameCombined = '';
            }
        }
        return arr;
    }
}

// legend
async function legend(){
    // wait for tiles to render
    await tiles();

    const LEGENDWIDTH = 500;
    const LEGENDHEIGHT = 50;
    const COLOR_DIM = 30;
    const SPACING = 60;

    const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('width', LEGENDWIDTH)
        .attr('height', LEGENDHEIGHT)
        .attr('transform', `translate(${(WIDTH - 400)/ 2}, ${SVGHEIGHT + PADDING + 20})`);


    const legendColors = legend.selectAll('rect')
        .data(colors).join('rect')
        .attr('class', 'legend-item')
        .attr('fill', d => d)
        .attr('fill-opacity', 0.6)
        .attr('width', COLOR_DIM)
        .attr('height', COLOR_DIM)
        .attr('x', (d, i) => i * SPACING);
    
    const legendCategories = legend.selectAll('text')
        .data(category).join('text')
        .attr('x', (d, i) => i * SPACING + COLOR_DIM / 2)
        .attr('y', COLOR_DIM + 12)
        .text(d => d)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('font-weight', 'bold');
}
legend();