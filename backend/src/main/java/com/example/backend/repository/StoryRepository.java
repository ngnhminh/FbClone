package com.example.backend.repository;

import com.example.backend.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByUserId(Long userId);

    List<Story> findByStatusAndCreatedAtBefore(Integer status, LocalDateTime createdAt);

    List<Story> findByStatus(Integer status);

    List<Story> findByUserIdAndStatus(Long userId, Integer status);

    List<Story> findByUserIdInAndAccessAndStatusAndCreatedAtAfter(
            List<Long> userIds, String access, Integer status, LocalDateTime createdAt);
}