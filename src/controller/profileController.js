const profileService = require("../service/profileService");
const prisma = require("../config/prisma");
const bucket = require("../config/storage");
const path = require("path");


async function getOtherProfile(req, res, next) {
    try {
        const { id } = req.params;

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                error: "User tidak ditemukan atau belum login"
            });
        }

        const profile = await profileService.getProfileById(id);

        res.status(200).json({
            message: "Berhasil menampilkan profile",
            profile
        });

    } catch (error) {
        next(error);
    }
}


async function getMyProfile(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                error: "User tidak ditemukan atau belum login"
            });
        }

        const profile = await profileService.getProfileById(
            req.user.id,
            req.user.role
        );

        res.status(200).json({
            message: "Berhasil menampilkan profile",
            profile
        });

    } catch (error) {
        next(error);
    }
}


async function updateDataProfile(req, res, next) {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                error: "User tidak ditemukan atau belum login"
            });
        }

        const existingProfile =
            await profileService.getProfileById(req.user.id);

        if (!existingProfile) {
            return res.status(404).json({
                error: "Profile tidak ditemukan"
            });
        }

        // Default menggunakan foto lama
        let imageUrl = existingProfile.photo;

        // Jika user mengupload foto baru
        if (req.file) {

            const fileName =
                `${req.user.id}/user-photos/${Date.now()}-${path.basename(req.file.originalname)}`;

            // Upload ke Google Cloud Storage
            const blob = bucket.file(fileName);

            const blobStream = blob.createWriteStream({
                resumable: false,
                contentType: req.file.mimetype,
            });

            await new Promise((resolve, reject) => {
                blobStream.on("error", reject);
                blobStream.on("finish", resolve);

                blobStream.end(req.file.buffer);
            });

            // URL foto di Google Cloud Storage
            imageUrl =
                `https://storage.googleapis.com/${bucket.name}/${fileName}`;


            // Hapus foto lama dari Google Cloud Storage
            if (existingProfile.photo) {

                try {

                    const oldFileName =
                        existingProfile.photo.split(`${bucket.name}/`)[1];

                    if (oldFileName) {

                        await bucket
                            .file(oldFileName)
                            .delete();

                        console.log(
                            `Foto lama berhasil dihapus: ${oldFileName}`
                        );
                    }

                } catch (err) {

                    console.warn(
                        "Gagal menghapus foto lama:",
                        err.message
                    );

                }
            }
        }


        const updatedProfile =
            await profileService.updateMyDataProfile(
                req.user.id,
                {
                    ...req.body,
                    photo: imageUrl
                }
            );


        const safeProfile = {
            id: updatedProfile.id,
            full_name: updatedProfile.full_name,
            phone: updatedProfile.phone,
            photo: updatedProfile.photo,
            role: updatedProfile.role,

            ...(updatedProfile.Farmers && {
                Farmers: updatedProfile.Farmers
            }),

            ...(updatedProfile.Buyers && {
                Buyers: updatedProfile.Buyers
            })
        };


        res.status(200).json({
            message: "Berhasil Memperbarui Profile",
            profile: safeProfile
        });

    } catch (error) {
        next(error);
    }
}


async function updatePasswordProfile(req, res, next) {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                error: "User tidak ditemukan atau belum login"
            });
        }

        await profileService.changeMyPasswordProfile(
            req.user.id,
            req.body
        );

        res.status(200).json({
            message: "Berhasil memperbarui akun"
        });

    } catch (error) {
        next(error);
    }
}


async function deleteProfile(req, res, next) {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                error: "User tidak ditemukan atau belum login"
            });
        }

        const existingProfile =
            await profileService.getProfileById(req.user.id);


        // Hapus foto profile dari Google Cloud Storage
        if (existingProfile?.photo) {

            try {

                const oldFileName =
                    existingProfile.photo.split(`${bucket.name}/`)[1];

                if (oldFileName) {

                    await bucket
                        .file(oldFileName)
                        .delete();

                    console.log(
                        `Foto berhasil dihapus: ${oldFileName}`
                    );
                }

            } catch (err) {

                console.warn(
                    "Gagal menghapus foto:",
                    err.message
                );

            }
        }


        // Hapus data profile dari database
        await profileService.deleteProfileById(req.user.id);


        res.status(200).json({
            message: "Profile deleted successfully"
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    getOtherProfile,
    getMyProfile,
    updateDataProfile,
    updatePasswordProfile,
    deleteProfile
};