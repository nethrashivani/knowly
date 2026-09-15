package com.skillswap.knowly_backend.controller;

import com.skillswap.knowly_backend.dto.SkillDTO;
import com.skillswap.knowly_backend.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Skill API", description = "CRUD operations for SkillSwap")
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    @Operation(summary = "Get all skills")
    public ResponseEntity<List<SkillDTO>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/my")
    @Operation(summary = "Get my skills")
    public ResponseEntity<List<SkillDTO>> getMySkills(Principal principal) {
        return ResponseEntity.ok(skillService.getMySkills(principal.getName()));
    }

    @GetMapping("/search")
    @Operation(summary = "Search skills by keyword")
    public ResponseEntity<List<SkillDTO>> searchSkills(@RequestParam String keyword) {
        return ResponseEntity.ok(skillService.searchSkills(keyword));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Filter skills by category")
    public ResponseEntity<List<SkillDTO>> getSkillsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(skillService.getSkillsByCategory(category));
    }

    @GetMapping("/other")
@Operation(summary = "Get skills with custom categories")
public ResponseEntity<List<SkillDTO>> getOtherSkills() {
    return ResponseEntity.ok(skillService.getOtherSkills());
}

    @GetMapping("/{id:\\d+}")
    @Operation(summary = "Get skill by ID")
    public ResponseEntity<SkillDTO> getSkillById(@PathVariable Long id) {
        return ResponseEntity.ok(skillService.getSkillById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new skill")
    public ResponseEntity<SkillDTO> createSkill(@Valid @RequestBody SkillDTO skillDTO,
            Principal principal) {
        return new ResponseEntity<>(skillService.createSkill(skillDTO, principal.getName()), HttpStatus.CREATED);
    }

    @PutMapping("/{id:\\d+}")
    @Operation(summary = "Update an existing skill")
    public ResponseEntity<SkillDTO> updateSkill(@PathVariable Long id,
            @Valid @RequestBody SkillDTO skillDTO,
            Principal principal) {
        return ResponseEntity.ok(skillService.updateSkill(id, skillDTO, principal.getName()));
    }

    @DeleteMapping("/{id:\\d+}")
    @Operation(summary = "Delete a skill")
    public ResponseEntity<String> deleteSkill(@PathVariable Long id,
            Principal principal) {
        skillService.deleteSkill(id, principal.getName());
        return ResponseEntity.ok("Skill deleted successfully");
    }
}
