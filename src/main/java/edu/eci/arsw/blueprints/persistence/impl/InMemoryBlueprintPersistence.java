/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.persistence.impl;

import edu.eci.arsw.blueprints.controllers.BlueprintAPIController;
import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.BlueprintsPersistence;
import edu.eci.arsw.blueprints.services.BlueprintsServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author NicoToro
 */

@Repository
public class InMemoryBlueprintPersistence implements BlueprintsPersistence{

    private final Map<Tuple<String,String>,Blueprint> blueprints=new HashMap<>();

    // Planos
    public InMemoryBlueprintPersistence(){

        Blueprint bp1 = new Blueprint( "Nicolas", "plano1", new Point[]{new Point(0, 0), new Point(10, 10)});
        Blueprint bp2 = new Blueprint( "Nicolas", "plano2", new Point[]{new Point(1, 1), new Point(11, 11)});
        Blueprint bp3 = new Blueprint( "Toro", "plano1", new Point[]{new Point(400, 400), new Point(12, 12)});
        Blueprint bp4 = new Blueprint( "Toro", "plano2", new Point[]{new Point(250, 500), new Point(12, 12)});
        Blueprint bp5 = new Blueprint( "Toro", "plano3", new Point[]{new Point(500, 250), new Point(12, 12)});

        blueprints.put(new Tuple<>(bp1.getAuthor(), bp1.getName()), bp1);
        blueprints.put(new Tuple<>(bp2.getAuthor(), bp2.getName()), bp2);
        blueprints.put(new Tuple<>(bp3.getAuthor(), bp3.getName()), bp3);
        blueprints.put(new Tuple<>(bp4.getAuthor(), bp4.getName()), bp4);
        blueprints.put(new Tuple<>(bp5.getAuthor(), bp5.getName()), bp5);
    }

    @Override
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        if (blueprints.containsKey(new Tuple<>(bp.getAuthor(),bp.getName()))){
            throw new BlueprintPersistenceException("The given blueprint already exists: "+bp);
        }
        else{
            blueprints.put(new Tuple<>(bp.getAuthor(),bp.getName()), bp);
        }        
    }

    @Override
    public Blueprint getBlueprint(String author, String bprintname) throws BlueprintNotFoundException {
        return blueprints.get(new Tuple<>(author, bprintname));
    }

    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> result=new HashSet<>();
        for (Map.Entry <Tuple<String, String>, Blueprint> entry : blueprints.entrySet()) {
            if (entry.getKey().getElem1().equals(author)) {
                result.add(entry.getValue());
            }
        }
        if (result.isEmpty()) {
            throw new BlueprintNotFoundException("No se encontraron resultados para " + author);
        }
        return result;
    }

    @Override
    public Set<Blueprint> getAllBlueprints() throws BlueprintNotFoundException {
        return new HashSet<>(blueprints.values());
    }

    @Override
    public void updateBlueprint(String author, String name, Blueprint updatedBlueprint) throws BlueprintNotFoundException {
        Blueprint existing = getBlueprint(author, name);
        if (existing == null) {
            throw new BlueprintNotFoundException("Blueprint not found: " + author + " - " + name);
        }

        existing.getPoints().clear();
        existing.getPoints().addAll(updatedBlueprint.getPoints());
    }

    @Override
    public void deleteBlueprint(String author, String name) throws BlueprintNotFoundException {
        Tuple<String, String> key = new Tuple<>(author, name);

        if (!blueprints.containsKey(key)) {
            throw new BlueprintNotFoundException("No existe el plano '" + name + "' del autor '" + author + "'.");
        }

        blueprints.remove(key);
    }

}
