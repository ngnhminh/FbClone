package com.example.backend.dto.user;

import com.example.backend.entity.User;
import lombok.Data;

@Data
public class UserStatsDTO {
    private Long userId;
    private String username;
    private String userNickname;
    private String avatar;
    private String bio;
    private Long followersCount;
    private Long followingCount;
    private Long postsCount;
    public UserStatsDTO(User user, Long followersCount, Long followingCount, Long postsCount) {
        this.userId = user.getId();
        this.username = user.getUserNickname();
        this.userNickname = user.getUserNickname();
        this.avatar = user.getUserImage();
        this.bio = user.getUserBio();
        this.followersCount = followersCount;
        this.followingCount = followingCount;
        this.postsCount = postsCount;
    }
} 