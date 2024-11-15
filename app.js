// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const token = '';
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

async function getTopTracks() {
  // Endpoint reference: https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  const topTracks = await fetchWebApi('v1/me/top/tracks?time_range=long_term&limit=5', 'GET');
  
  // Extract the track IDs and store them in an array
  const topTracksIds = topTracks.items.map(track => track.id);

  // Log the track names and artists
  console.log(
    topTracks.items.map(
      ({ name, artists }) => `${name} by ${artists.map(artist => artist.name).join(', ')}`
    )
  );

  return topTracksIds; // Return the IDs
}


const topTracksIds = await getTopTracks();
// console.log(
//   topTracks?.map(
//     ({name, artists}) =>
//       `${name} by ${artists.map(artist => artist.name).join(', ')}`
//   )
// );

async function getRecommendations(){
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-recommendations
    return (await fetchWebApi(
      `v1/recommendations?limit=10&seed_tracks=${topTracksIds.join(',')}&max_popularity=40`, 'GET'
    )).tracks;
  }
  
  const recommendedTracks = await getRecommendations();
  console.log(
    recommendedTracks.map(
      ({name, artists}) =>
        `${name} by ${artists.map(artist => artist.name).join(', ')}`
    )
  );
