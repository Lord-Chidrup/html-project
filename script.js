async function getSuggestions() {
    const query = document.getElementById("searchQuery").value.trim();
    const suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = ''; // Clear previous suggestions

    if (query) {
        const suggestionsUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${encodeURIComponent(query)}&limit=5`;

        try {
            const response = await fetch(suggestionsUrl);
            const data = await response.json();

            const suggestions = data[1]; // The second element in the response contains the suggestions
            if (suggestions.length > 0) {
                suggestions.forEach(suggestion => {
                    const suggestionDiv = document.createElement('div');
                    suggestionDiv.textContent = suggestion;
                    suggestionDiv.onclick = () => {
                        document.getElementById("searchQuery").value = suggestion;
                        suggestionsDiv.innerHTML = ''; // Clear suggestions when clicked
                        searchWiki();
                    };
                    suggestionsDiv.appendChild(suggestionDiv);
                });
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }
}

async function searchWiki() {
    const query = document.getElementById("searchQuery").value.trim();
    const resultDiv = document.getElementById("result");
    const imageResultDiv = document.getElementById("imageResult");
    resultDiv.innerHTML = ""; // Clear previous results
    imageResultDiv.innerHTML = ""; // Clear previous images

    if (query) {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(query)}`;

        try {
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();
            const pageId = searchData.query.search[0]?.pageid;

            if (pageId) {
                const contentUrl = `https://en.wikipedia.org/w/api.php?action=parse&pageid=${pageId}&format=json&origin=*`;
                const contentResponse = await fetch(contentUrl);
                const contentData = await contentResponse.json();
                const title = contentData.parse.title;
                const content = contentData.parse.text['*'];

                resultDiv.innerHTML = `
                    <h2>${title}</h2>
                    <div>${content}</div>
                `;

                // Fetch images related to the topic
                const imageSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&origin=*`;
                const imageResponse = await fetch(imageSearchUrl);
                const imageData = await imageResponse.json();
                const page = imageData.query.pages[Object.keys(imageData.query.pages)[0]];
                if (page && page.thumbnail) {
                    const image = document.createElement('img');
                    image.src = page.thumbnail.source;
                    resultDiv.prepend(image);
                }

                // Fetch additional images
                const additionalImageUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json&origin=*`;
                const additionalImageResponse = await fetch(additionalImageUrl);
                const additionalImageData = await additionalImageResponse.json();

                additionalImageData.query.search.forEach(item => {
                    const imgUrl = `https://en.wikipedia.org/wiki/File:${item.title.replace(/ /g, '_')}.jpg`;
                    const img = document.createElement('img');
                    img.src = imgUrl; // URL might need adjustment depending on availability
                    imageResultDiv.appendChild(img);
                });
            } else {
                resultDiv.innerHTML = "No results found.";
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    }
}
