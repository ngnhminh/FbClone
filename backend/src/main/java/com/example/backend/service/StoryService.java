package com.example.backend.service;

import com.example.backend.entity.Follow;
import com.example.backend.entity.Story;
import com.example.backend.entity.User;
import com.example.backend.repository.FollowRepository;
import com.example.backend.repository.StoryRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.AwsS3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StoryService {
    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AwsS3Service awsS3Service;

    @Autowired
    private FollowRepository followRepository;

    @Transactional
    public Story createStory(Long userId, MultipartFile file, String access, Integer status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = System.currentTimeMillis() + "_story" + extension;

            // Upload to S3
            String url = awsS3Service.uploadFile(fileName, file.getBytes());

            // Create and save story
            Story story = new Story();
            story.setUser(user);
            story.setUrl(url);
            story.setAccess(access);
            story.setStatus(status);

            return storyRepository.save(story);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    public List<Story> getStoriesByUserId(Long userId) {
        return storyRepository.findByUserIdAndStatus(userId, 1);
    }

    public List<Story> getAllStories() {
        return storyRepository.findByStatus(1);
    }

    @Transactional
    public void deleteStory(Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));
        story.setStatus(0);
        storyRepository.save(story);
    }

//    @Scheduled(fixedRate = 60000) // Chạy mỗi phút
//    @Transactional
//    public void updateExpiredStories() {
//        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
//        List<Story> expiredStories = storyRepository.findByStatusAndCreatedAtBefore(1, twentyFourHoursAgo);
//
//        for (Story story : expiredStories) {
//            story.setStatus(2);
//            storyRepository.save(story);
//        }
//    }
    // @Scheduled(fixedRate = 60000) // Chạy mỗi phút
    // @Transactional
    // public void updateExpiredStories() {
    //     LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
    //     List<Story> expiredStories = storyRepository.findByStatusAndCreatedAtBefore(1, twentyFourHoursAgo);

    //     for (Story story : expiredStories) {
    //         story.setStatus(2);
    //         storyRepository.save(story);
    //     }
    // }
    public List<Story> getStoriesFromFollowing(Long userId) {
        // Lấy danh sách người dùng mà userId đang follow
        List<Follow> following = followRepository.findByFollowerId(userId);
        List<Long> followingIds = following.stream()
                .map(follow -> follow.getFollowing().getId())
                .collect(Collectors.toList());

        // Lấy thời gian 24 giờ trước
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);

        // Sử dụng phương thức mới từ repository
        return storyRepository.findByUserIdInAndAccessAndStatusAndCreatedAtAfter(
                followingIds, "PUBLIC", 1, twentyFourHoursAgo);
    }
}