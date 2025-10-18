//@author

apiclient = (() => {

    const baseUrl = "http://localhost:8080/blueprints";

    const getBlueprintsByAuthor = (authname, callback) => {
        fetch(`${baseUrl}/${authname}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la consulta de autor " + authname);
                }
                return response.json();
            })
            .then(data => callback(data))
            .catch(error => console.error("Error:", error));
    };

    const getBlueprintsByNameAndAuthor = (authname, bpname, callback) => {
        fetch(`${baseUrl}/${authname}/${bpname}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la consulta del plano " + bpname);
                }
                return response.json();
            })
            .then(data => callback(data))
            .catch(error => console.error("Error:", error));
    };

    const updateBlueprint = (author, bpname, blueprint) => {
        return $.ajax({
            url: `${baseUrl}/${author}/${bpname}`,
            type: "PUT",
            data: JSON.stringify(blueprint),
            contentType: "application/json"
        });
    };

    const createBlueprint = (blueprint) => {
        return $.ajax({
            url: baseUrl,
            type: "POST",
            data: JSON.stringify(blueprint),
            contentType: "application/json"
        });
    };

    const deleteBlueprint = (author, bpname) => {
        return $.ajax({
            url: `${baseUrl}/${author}/${bpname}`,
            type: "DELETE"
        });
    };


    return {
        getBlueprintsByAuthor,
        getBlueprintsByNameAndAuthor,
        updateBlueprint,
        createBlueprint,
        deleteBlueprint
    };

})();
