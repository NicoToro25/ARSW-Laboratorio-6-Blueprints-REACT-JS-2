const app = (() => {

    let author = null;
    let blueprints = [];
    let currentBlueprint = null;
    let isNewBlueprint = false;

    // apimock/apiclient
    const api = apiclient;

    const changeAuthor = (newAuthor) => {
        author = newAuthor;
        updateBlueprints();
    };

    const updateBlueprints = () => {
        api.getBlueprintsByAuthor(author, (data) => {
            blueprints = data.map((bp) => ({
                name: bp.name,
                points: bp.points.length
            }));

            $("#blueprintsTable tbody").empty();

            blueprints.forEach((bp) => {
                $("#blueprintsTable tbody").append(
                    `<tr>
                        <td>${bp.name}</td>
                        <td>${bp.points}</td>
                        <td>
                            <button onclick="app.drawBlueprint('${author}','${bp.name}')">Open</button>
                            <button onclick="app.deleteBlueprint('${author}','${bp.name}')">Delete</button>
                        </td>
                    </tr>`
                );
            });

            const totalPoints = data.reduce((sum, bp) => sum + bp.points.length, 0);
            $("#totalPoints").text(totalPoints);
        });
    };

    const drawBlueprint = (author, bpname) => {
        api.getBlueprintsByNameAndAuthor(author, bpname, (blueprint) => {

            currentBlueprint = blueprint;
            redrawBlueprint();
        });
    };

    const redrawBlueprint = () => {
        const canvas = document.getElementById("blueprintCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!currentBlueprint || currentBlueprint.points.length === 0) return;

        ctx.beginPath();
        ctx.moveTo(currentBlueprint.points[0].x, currentBlueprint.points[0].y);
        for (let i = 0; i < currentBlueprint.points.length; i++) {
            const p = currentBlueprint.points[i];
            ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();

    }

    // Manejador de eventos del Canvas
    const initCanvasEvents = () => {
        const canvas = document.getElementById("blueprintCanvas");

        const ctx = canvas.getContext("2d");

        canvas.addEventListener("pointerdown", (event) => {

            if (!currentBlueprint) {
                console.warn("No hay plano seleccionado.");
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            console.log("Click en:", x, y);

            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();

            currentBlueprint.points.push({ x, y });

            redrawBlueprint();
        });
    };

    const createNewBlueprint = () => {
        if (!author) {
            alert("Primero ingresa un autor.");
            return;
        }

        const name = prompt("Ingrese el nombre del nuevo blueprint:");
        if (!name) return;

        currentBlueprint = {
            author: author,
            name: name,
            points: []
        };
        isNewBlueprint = true;

        const canvas = document.getElementById("blueprintCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        alert("Haz clic en el canvas para añadir puntos.");
    }

    const saveBlueprint = () => {
        if (!currentBlueprint || !author) return;

        const promise = isNewBlueprint
            ? api.createBlueprint(currentBlueprint) // POST
            : api.updateBlueprint(author, currentBlueprint.name, currentBlueprint); // PUT

        promise
            .then(() => {
                alert(isNewBlueprint ? "Plano creado con éxito" : "Plano actualizado correctamente");
                isNewBlueprint = false;
                updateBlueprints();
            })
            .catch(err => console.error("Error al guardar:", err));
    };

    const clearCanvas = () => {
        const canvas = document.getElementById("blueprintCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const deleteBlueprint = (author, bpname) => {
        if (!confirm(`¿Deseas eliminar el plano "${bpname}" de ${author}?`)) {
            return;
        }

        api.deleteBlueprint(author, bpname)
            .then(() => {
                alert("Plano eliminado correctamente.");
                if (currentBlueprint && currentBlueprint.name === bpname) {
                    clearCanvas();
                    currentBlueprint = null;
                }
                updateBlueprints();
            })
            .catch(error => {
                console.error("Error al eliminar:", error);
                alert("Error al eliminar el plano.");
            });
    };

    $(document).ready(() => {
        initCanvasEvents();

        $("#saveBlueprint").click(saveBlueprint);
        $("#createBlueprint").click(createNewBlueprint);
    });

    return {
        changeAuthor,
        drawBlueprint,
        saveBlueprint,
        createNewBlueprint,
        deleteBlueprint
    };
})();
