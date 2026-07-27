package com.jec.cist.repositories;

import com.jec.cist.models.PersonalInstitucional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface PersonalInstitucionalRepository extends JpaRepository<PersonalInstitucional, UUID> {
}
