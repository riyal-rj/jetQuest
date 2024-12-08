export const displayMap=(locations)=>{
    mapboxgl.accessToken = 'pk.eyJ1Ijoicml5YWwtcmoiLCJhIjoiY200Y2FmbTZ0MDhhajJrczh2NW1scjQ1NSJ9.7B9ODFbREa-XLpx-e8CH3g';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/riyal-rj/cm4cbfgkv00u201r12dn95qee',
        projection:'mercator',
        scrollZoom:false
    });
    const bounds=new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        //Create marker
        const el=document.createElement('div');
        el.className='marker';

        //Add marker
        new mapboxgl.Marker({
            elememt:el,
            anchor:'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        //Add popup
        new mapboxgl.Popup({
            offset:30
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);

        //Extend map bounds to include curr locations
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds,{
        padding:{
            top:200,
            bottom:200,
            left:200,
            right:200
        }
    });
}
