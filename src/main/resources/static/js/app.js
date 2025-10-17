const app = (() => {

    let author = null;
    let blueprints = [];
    let currentBlueprint = null;

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
                        <td><button onclick="app.drawBlueprint('${author}','${bp.name}')">Open</button></td>
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

    const saveBlueprint = () => {
        if (!currentBlueprint || !author) {
            alert("No hay plano seleccionado");
            return;
        }

        api.updateBlueprint(author, currentBlueprint.name, currentBlueprint)
            .then(() => {
                console.log("Plano guardado exitosamente.")
                alert("Plano guardado");
                updateBlueprints();
            })
            .catch(err => console.error("Error al guardar", err));
    };

    $(document).ready(() => {
        initCanvasEvents();
    });

    return {
        changeAuthor,
        drawBlueprint,
        saveBlueprint
    };
})();
